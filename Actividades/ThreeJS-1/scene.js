/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/

// Global objects
let renderer = null,
    scene = null,
    camera = null,
    gCanvas = null

// The last 3D Object group created
let lastGroup = null

let geometries = [] //Stores all geometries
let materials = [] // Stores all materials

let objs = [] // Objects created
let satellites = [] // Satellites created

let duration = 5000; // ms
let currentTime = Date.now();

let satelliteCount = 0 // Object's satellite counter

/**
 * Animations, rotates the objects
 */
function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();


    objs.forEach((obj) => {
        obj.rotation.y -= angle / 2;
        obj.rotation.z += angle;
    })


    satellites.forEach((obj) => {
        obj.rotation.y += 0.03;
    });


}

/**
 * Scene rendering loop
 */
function run() {
    requestAnimationFrame(function () { run(); });

    // Render the scene
    renderer.render(scene, camera);

    // Spin the cube for next frame
    animate();
}

/**
 * Initializes the main components of the scene
 */
function createScene(canvas) {

    gCanvas = canvas

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Set the viewport size
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color(0.2, 0.2, 0.2);
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 4000);
    camera.position.z = 10;
    scene.add(camera);

    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0, -2, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    initGeometries()
    initMaterials()

}

/**
 * Initializes the objects' geometries 
 * Uses Three.js primitives
 */
function initGeometries() {

    const cubeGeo = new THREE.CubeGeometry(2, 2, 2)
    geometries.push(cubeGeo)

    const coneGeo = new THREE.ConeGeometry(1.5, 4.5, 32)
    geometries.push(coneGeo)

    const sphereGeo = new THREE.SphereGeometry(2, 12, 8)
    geometries.push(sphereGeo)

    const torusGeo = new THREE.TorusGeometry(2, 0.5, 16, 70)
    geometries.push(torusGeo)

    const tetraGeo = new THREE.TetrahedronGeometry(2)
    geometries.push(tetraGeo)

    const icosaGeo = new THREE.IcosahedronGeometry(2, 0)
    geometries.push(icosaGeo)

    const cylinderGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32)
    geometries.push(cylinderGeo)

    const dodeGeo = new THREE.DodecahedronGeometry(2, 0)
    geometries.push(dodeGeo)

    const parametricGeo = new THREE.ParametricGeometry(klein, 25, 25);
    geometries.push(parametricGeo)

    const knotGeo = new THREE.TorusKnotGeometry(1, 1, 100, 2);
    geometries.push(knotGeo)



}

/**
 * Initializes the materials for the meshes
 * Textures and colors
 */
function initMaterials() {

    const textureUrl = "../../img/ash_uvgrid01.jpg"
    const texture = new THREE.TextureLoader().load(textureUrl)
    const materialT = new THREE.MeshPhongMaterial({ map: texture })

    const textureUrlFloor = "../../img/floor15.jpg"
    const textureFloor = new THREE.TextureLoader().load(textureUrlFloor)
    const materialFloor = new THREE.MeshPhongMaterial({ map: textureFloor })

    const textureUrlWater = "../../img/water_texture_2.jpg"
    const textureWater = new THREE.TextureLoader().load(textureUrlWater)
    const materialWater = new THREE.MeshPhongMaterial({ map: textureWater })

    const textureUrlCrate = "../../img/wooden_crate_2.png"
    const textureCrate = new THREE.TextureLoader().load(textureUrlCrate)
    const materialCrate = new THREE.MeshPhongMaterial({ map: textureCrate })

    const textureUrlDem = "../../img/dem.PNG"
    const textureDem = new THREE.TextureLoader().load(textureUrlDem)
    const materialDem = new THREE.MeshPhongMaterial({ map: textureDem })


    const materialYellow = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
    const materialBlue = new THREE.MeshPhongMaterial({ color: 0x303f9f });
    const materialPink = new THREE.MeshPhongMaterial({ color: 0xe91e63 });
    const materialGreen = new THREE.MeshPhongMaterial({ color: 0x43a047 });
    const materialBrown = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
    const materialWhite = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });

    materials.push(materialT)
    materials.push(materialFloor)
    materials.push(materialWater)
    materials.push(materialCrate)
    materials.push(materialDem)

    materials.push(materialYellow)
    materials.push(materialBlue)
    materials.push(materialPink)
    materials.push(materialGreen)
    materials.push(materialBrown)
    materials.push(materialWhite)

}

/**
 * Called when the user clicks on the add button
 * Adds object to the scene
 */
function addObject() {

    document.getElementById('clearButton').disabled = false

    const randomG = getRandomInt(geometries.length)
    const randomM = getRandomInt(materials.length)

    if (objs.length < 4) {

        hideAlert('sat')
        satelliteCount = 0

        if (objs.length == 0) {
            let parentGroup = createGroup(geometries[randomG], materials[randomM], [0, 0, -10])
            scene.add(parentGroup)

            lastGroup = parentGroup

            addMouseHandler(gCanvas, lastGroup)
        } else {
            let childGroup = createGroup(geometries[randomG], materials[randomM], getRandomPos())
            addToGroup(lastGroup, childGroup)
        }

    } else {

        showAlert('Reached object limit (4)', 'group')

    }

}

/**
 * Called when the user clicks on the satellite button
 * Adds satellite to object
 */
function addSatellite() {

    if (lastGroup == null) {
        showAlert('Add an object first', null)
        return
    }


    const randomG = getRandomInt(geometries.length)
    const randomM = getRandomInt(materials.length)

    satelliteCount += 1

    if (satelliteCount <= 3) {

        let pivotPoint = new THREE.Object3D()
        //pivotPoint.rotation.x = 0.4
        lastGroup.add(pivotPoint)

        let geo = geometries[randomG]
        let mat = materials[randomM]
        let pos = [3, 0, -2]

        const obj = new THREE.Mesh(geo, mat)
        obj.scale.set(0.2, 0.2, 0.2)
        obj.position.set(pos[0], pos[1], pos[2])

        pivotPoint.add(obj)

        satellites.push(pivotPoint)

    } else {

        showAlert('Reached satellite limit (3)', 'sat')

    }


}

/**
 * Called when the user clicks on the clear button
 * Removes handlers and clears global variables
 */
function clearCanvas() {

    objs = []
    satellites = []
    lastGroup = null
    satelliteCount = 0

    hideAlert('sat')
    hideAlert('group')

    // Last item is the first 3D object created.
    // This removes all group and satellite children
    scene.remove(scene.children[scene.children.length - 1])

    document.getElementById('clearButton').disabled = true

    removeHandler(gCanvas)

    renderer.clear()

}

/**
 * Creates a 3D Object group and a mesh to add.
 * Receives the geometry, material and position of the mesh
 * Returns the 3D Object group
 */
function createGroup(geometry, material, position) {

    const group = new THREE.Object3D
    const obj = new THREE.Mesh(geometry, material)

    group.add(obj)

    group.position.x = position[0]
    group.position.y = position[1]
    group.position.z = position[2]

    objs.push(obj)

    return group

}

/**
 * Add a 3D object to a group object
 * Receives parent and child object
 */
function addToGroup(parent, child) {

    parent.add(child)
    lastGroup = child

}

/**
 * Shows HTML alert
 * Receives text to display and the type of alert
 */
function showAlert(text, type) {

    document.getElementById('limitAlert').style.display = 'block'

    if (type == 'group') {
        document.getElementById('limitAlert').innerText = text
        document.getElementById('addButton').disabled = true
    } else if (type == 'sat') {
        document.getElementById('limitAlert').innerText = text
        document.getElementById('satelliteButton').disabled = true
    } else {
        document.getElementById('limitAlert').innerText = text
    }

}

/**
 * Hides HTML alert
 * Receives the type of alert
 */
function hideAlert(type) {

    document.getElementById('limitAlert').style.display = 'none'

    if (type == 'group') {
        document.getElementById('addButton').disabled = false
    } else {
        document.getElementById('satelliteButton').disabled = false
    }

}

/**
 * Generates random integer from 0 to max
 * Receives the exclusive max limit
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

/**
 * Generates random float in a range
 * Receives the inclusive min and exclusive max limit
 */
function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min)
}

/**
 * Generate random position for the new objects
 */
function getRandomPos() {

    let x = getRandomFloat(-7, 10)
    let y = getRandomFloat(5, 5)
    let z = getRandomFloat(-5, 5)

    return [x, y, z]

}

/**
 * Helper function for the parametric geometry
 */
function klein(v, u, target) {

    u *= Math.PI
    v *= 2 * Math.PI
    u = u * 2

    let x
    let z

    if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v)
        z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v)
    } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI)
        z = -8 * Math.sin(u)
    }

    const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v)

    target.set(x, y, z).multiplyScalar(0.25)

}



