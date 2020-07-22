/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/


// Global objects
let renderer = null,
    scene = null,
    camera = null,
    gCanvas = null,
    controls = null,
    clock = null

let duration = 5000 // ms
let currentTime = Date.now()

let planets = []
let moons = []

let sunObject = null

/**
 * Animation for the objects
 */
function animate() {

    let delta = 5 * clock.getDelta()

    uniforms["time"].value += 0.2 * delta

    sunObject.rotation.y += 0.005

    planets.forEach((planet) => {
        planet.obj.rotation.y += planet.orbitSpeed
        planet.mesh.rotation.y += planet.rotation
    })

    moons.forEach((moon) => {
        moon.rotation.y += 0.015
    })

    renderer.render(scene, camera)

}


/**
 * Scene rendering loop
 */
function run() {
    requestAnimationFrame(function () { run() })

    // Render the scene
    renderer.render(scene, camera)

    animate()
    controls.update()
}

/**
 * Initializes the main components of the scene
 */
function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    })

    // Set the viewport size
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    // Create a new Three.js scene
    scene = new THREE.Scene()

    // Set the skybox 
    const loaderCube = new THREE.CubeTextureLoader()
    const texture = loaderCube.load([
        '../../img/Solar_System/skybox_1.jpg',
        '../../img/Solar_System/skybox_1.jpg',
        '../../img/Solar_System/skybox_2.jpg',
        '../../img/Solar_System/skybox_2.jpg',
        '../../img/Solar_System/skybox_1.jpg',
        '../../img/Solar_System/skybox_2.jpg',
    ])

    scene.background = texture

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 4000)
    camera.position.y = 5
    camera.position.z = 55
    scene.add(camera)

    // Position of the sun object
    let sunPos = [0, 0, -5]

    // Add a point light from the sun object
    let light = new THREE.PointLight(0xffffff, 1.0)
    light.position.set(...sunPos)
    scene.add(light)

    clock = new THREE.Clock()

    const loadManager = new THREE.LoadingManager()
    const textureLoader = new THREE.TextureLoader(loadManager)

    const loadingElem = document.querySelector('#loading')
    const progressBarElem = loadingElem.querySelector('.progressbar')

    // Load all the necessary texture
    let sunTexture = textureLoader.load('../../img/Solar_System/cloud.png')
    let sunTexure2 = textureLoader.load('../../img/Solar_System/sun.jpg')

    let mercuryTexture = textureLoader.load('../../img/Solar_System/mercury.jpg')
    let venusTexture = textureLoader.load('../../img/Solar_System/venus_texture.jpg')
    // Earth & Moon textures
    let earthTexture = textureLoader.load('../../img/Solar_System/earth_texture.jpg')
    let earthNormal = textureLoader.load('../../img/Solar_System/earth_normal.png')
    let earthSpecular = textureLoader.load('../../img/Solar_System/earth_specular.png')
    let earthClouds = textureLoader.load('../../img/Solar_System/earth_clouds.jpg')
    let moonTexture = textureLoader.load('../../img/Solar_System/moon.jpg')

    let marsTexture = textureLoader.load('../../img/Solar_System/mars.jpg')
    let asteroidTexture = textureLoader.load('../../img/Solar_System/asteroid.jpg')
    // Jupiter and its moons
    let jupiterTexture = textureLoader.load('../../img/Solar_System/jupiter.jpg')
    let ioTexture = textureLoader.load('../../img/Solar_System/io_moon.jpg')
    let europaTexture = textureLoader.load('../../img/Solar_System/europa_moon.jpg')
    let ganymedeTexture = textureLoader.load('../../img/Solar_System/ganymede_moon.jpg')
    let callistoTexture = textureLoader.load('../../img/Solar_System/callisto_moon.jpg')
    // Saturn and its biggest moon
    let saturnTexture = textureLoader.load('../../img/Solar_System/saturn.jpg')
    let ringTexture = textureLoader.load('../../img/Solar_System/saturn_ring.jpg')
    let titanTexture = textureLoader.load('../../img/Solar_System/titan_moon.jpg')

    let uranusTexture = textureLoader.load('../../img/Solar_System/uranus.jpg')
    let neptuneTexture = textureLoader.load('../../img/Solar_System/neptune.jpg')
    let plutoTexture = textureLoader.load('../../img/Solar_System/pluto.jpg')

    loadManager.onLoad = () => {

        loadingElem.style.display = 'none'

        initSun(sunTexture, sunTexure2)

        initMercury(mercuryTexture)
        initVenus(venusTexture)
        initEarth(earthTexture, earthNormal, earthSpecular, earthClouds, moonTexture)
        initMars(marsTexture)
        initAsteroidBelt(asteroidTexture)
        initJupiter(jupiterTexture, ioTexture, europaTexture, ganymedeTexture, callistoTexture)
        initSaturn(saturnTexture, ringTexture, titanTexture)
        initUranus(uranusTexture)
        initNeptune(neptuneTexture)
        initPluto(plutoTexture)

        // Controls target the sun position
        controls = new THREE.OrbitControls(camera, canvas)
        controls.target.set(...sunPos)
        controls.update()

        // In case window is resized
        window.addEventListener('resize', onWindowResize);

        // Call the main loop once everything is loaded
        run()

    }

    // Show progress withe HTML element
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal
        progressBarElem.style.transform = `scaleX(${progress})`
    }

}


/**
 * Initializes the Sun object
 * Recevies the loaded textures
 */
function initSun(t1, t2) {

    uniforms = {
        "fogDensity": { value: 0.45 },
        "fogColor": { value: new THREE.Vector3(0, 0, 0) },
        "time": { value: 1.0 },
        "uvScale": { value: new THREE.Vector2(2.0, 1.2) },
        "texture1": { value: t1 },
        "texture2": { value: t2 },
    }
    uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT = THREE.RepeatWrapping
    uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT = THREE.RepeatWrapping

    let radius = 5.0

    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    })

    sunObject = new THREE.Mesh(new THREE.SphereGeometry(radius, 30, 30), material)
    sunObject.position.z = -5

    scene.add(sunObject)

}


/**
 * Initializes the Mercury object
 * Recevies the loaded texture
 */
function initMercury(texture) {

    let radius = 0.2
    let distance = 8.5

    let material = new THREE.MeshPhongMaterial({
        map: texture
    })

    let mercuryMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 30, 30), material)
    mercuryMesh.position.set(distance, 0, 0)
    mercuryMesh.rotation.z = Math.PI * 0.00055

    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(mercuryMesh)

    let orbit = createOrbit(distance, 0x873600)
    sunObject.add(orbit)

    let mercury = {
        mesh: mercuryMesh,
        obj: pivotPoint,
        orbitSpeed: 0.03,
        rotation: 2.93,
    }

    planets.push(mercury)

}


/**
 * Initializes the Venus object
 * Recevies the loaded texture
 */
function initVenus(texture) {

    let radius = 0.49
    let distance = 11.2

    let material = new THREE.MeshPhongMaterial({ map: texture })

    let venusMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 30, 30), material)
    venusMesh.position.set(distance, 0, 0)
    venusMesh.rotation.z = Math.PI * 0.983

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(venusMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0xF1D732)
    sunObject.add(orbit)

    // Planet's object with its data
    let venus = {
        mesh: venusMesh,
        obj: pivotPoint,
        orbitSpeed: 0.022,
        rotation: -12.15,
    }

    planets.push(venus)

}


/**
 * Initializes the Earth and its satellites 
 * Recevies the loaded textures
 */
function initEarth(earthTexture, normal, specular, cloudsTexture, moonTexture) {

    let radiusEarth = 0.52
    let radiusMoon = 0.14

    // Distance fom the Earth to the Sun
    let distanceEarth = 15.5

    let material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: normal,
        specularMap: specular,
        specular: new THREE.Color('grey'),
    })

    let earthMesh = new THREE.Mesh(new THREE.SphereGeometry(radiusEarth, 32, 32), material)
    earthMesh.receiveShadow = true
    earthMesh.position.set(distanceEarth, 0, 0)
    earthMesh.rotation.z = Math.PI * 0.127

    // Cloud Sphere over the Earth mesh
    {
        let geometry = new THREE.SphereGeometry(radiusEarth, 32, 32)
        let material = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            side: THREE.DoubleSide,
            opacity: 0.8,
            transparent: true,
            depthWrite: false,
        })
        let cloudMesh = new THREE.Mesh(geometry, material)
        earthMesh.add(cloudMesh)
    }

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(earthMesh)

    // Draw the  orbit
    let orbit = createOrbit(distanceEarth, 0x0A19AF)
    sunObject.add(orbit)

    // Pivot for Earth's moon
    let earthPivot = new THREE.Object3D()
    earthMesh.add(earthPivot)

    // Create the moon 
    {
        let material = new THREE.MeshPhongMaterial({ map: moonTexture })
        let moon = createMoon(radiusMoon, material)
        moon.position.x = 1.0
        moons.push(moon)

        earthPivot.add(moon)
    }
    moons.push(earthPivot)

    // Planet's object with its data
    let earth = {
        mesh: earthMesh,
        obj: pivotPoint,
        orbitSpeed: 0.018,
        rotation: 0.05,
    }

    planets.push(earth)

}


/**
 * Initializes the Mars object
 * Recevies the loaded texture
 */
function initMars(texture) {

    let radius = 0.28
    let distance = 23.6

    let material = new THREE.MeshPhongMaterial({ map: texture })

    let marsMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 30, 30), material)
    marsMesh.position.set(distance, 0, 0)
    marsMesh.rotation.z = Math.PI * 0.138

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(marsMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0xFF3838)
    sunObject.add(orbit)

    let mars = {
        mesh: marsMesh,
        obj: pivotPoint,
        orbitSpeed: 0.015,
        rotation: 0.051,
    }

    planets.push(mars)

}


/**
 * Initializes several objects between Mars and Jupiter
 * Recevies the loaded texture
 */
function initAsteroidBelt(texture) {

    let radius = 0.15
    let distance = 28

    let material = new THREE.MeshPhongMaterial({ map: texture })

    // Pivot for all the objects
    let pivotPoint = new THREE.Object3D()

    // Draw the orbit
    let orbit = createOrbit(distance, 0xFFFFFF)
    sunObject.add(orbit)

    // Maximum nuber of asteroids
    const maxAsteroids = 240

    for (let i = 0; i < maxAsteroids; i++) {

        // Size offset
        let offset = getRandomFloat(0, 0.07)
        let obj = new THREE.Mesh(new THREE.OctahedronGeometry(radius + offset, 1), material)

        let x = 0
        let y = getRandomFloat(-2.5, 2.5)
        let z = 0

        // Change positions to form a circle
        if (i > 0 && i <= 40) {
            x = getRandomFloat(26, 31)
            z = getRandomFloat(-12, 13)
        } else if (i > 40 && i <= 80) {
            x = getRandomFloat(-26, -31)
            z = getRandomFloat(-12, 13)
        } else if (i > 80 && i <= 120) {
            x = getRandomFloat(-15, 15)
            z = getRandomFloat(-25, -30)
        } else if (i > 120 && i <= 160) {
            x = getRandomFloat(-15, 15)
            z = getRandomFloat(25, 30)
        } else if (i > 160 && i < 180) {
            x = getRandomFloat(-16, -25)
            z = getRandomFloat(-22, -18)
        } else if (i > 180 && i <= 200) {
            x = getRandomFloat(16, 25)
            z = getRandomFloat(-22, -18)
        } else if (i > 200 && i <= 220) {
            x = getRandomFloat(-16, -25)
            z = getRandomFloat(22, 18)
        } else if (i > 220 && i < maxAsteroids) {
            x = getRandomFloat(16, 25)
            z = getRandomFloat(22, 18)
        }

        obj.position.set(x, y, z)
        pivotPoint.add(obj)

    }

    // Add single pivot point to Sun
    sunObject.add(pivotPoint)

}


/**
 * Initializes Jupiter and its main satellites
 * Recevies the loaded textures
 */
function initJupiter(jupiterTexture, ioTexture, europaTexture, ganymedeTexture, callistoTexture) {

    let radius = 1.5
    let distance = 35

    let material = new THREE.MeshPhongMaterial({ map: jupiterTexture })

    let jupiterMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material)
    jupiterMesh.position.set(distance, 0, 0)
    jupiterMesh.rotation.z = Math.PI * 0.0166

    // Pivot for the movemnt around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(jupiterMesh)

    // Draw orbit
    let orbit = createOrbit(distance, 0xF18503)
    sunObject.add(orbit)

    // Pivot for Jupiter's moons
    let jupiterPivot = new THREE.Object3D()
    jupiterMesh.add(jupiterPivot)

    // Io moon
    {
        let material = new THREE.MeshPhongMaterial({ map: ioTexture })
        let ioMoon = createMoon(0.145, material)
        ioMoon.position.x = 1.9

        moons.push(ioMoon)

        jupiterPivot.add(ioMoon)
    }

    // Europa moon
    {
        let material = new THREE.MeshPhongMaterial({ map: europaTexture })
        let europaMoon = createMoon(0.13, material)
        europaMoon.position.x = 2.4

        moons.push(europaMoon)

        jupiterPivot.add(europaMoon)
    }

    // Ganymede moon
    {
        let material = new THREE.MeshPhongMaterial({ map: ganymedeTexture })
        let ganymedeMoon = createMoon(0.19, material)
        ganymedeMoon.position.x = 2.8

        moons.push(ganymedeMoon)

        jupiterPivot.add(ganymedeMoon)
    }

    // Callisto moon
    {
        let material = new THREE.MeshPhongMaterial({ map: callistoTexture })
        let callistoMoon = createMoon(0.175, material)
        callistoMoon.position.x = 3.2

        moons.push(callistoMoon)

        jupiterPivot.add(callistoMoon)
    }

    moons.push(jupiterPivot)

    // Planet's object with its data
    let jupiter = {
        mesh: jupiterMesh,
        obj: pivotPoint,
        orbitSpeed: (8.29 * Math.pow(10, -3)),
        rotation: 0.02,
    }

    planets.push(jupiter)

}


/**
 * Initializes Saturn and its main moon
 * Recevies the loaded textures
 */
function initSaturn(saturnTexure, ringTexture, titanTexture) {

    let radius = 1.15
    let distance = 42

    let material = new THREE.MeshPhongMaterial({ map: saturnTexure })

    let saturnMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material)
    saturnMesh.receiveShadow = true
    saturnMesh.position.set(distance, 0, 0)
    saturnMesh.rotation.z = Math.PI * 0.15

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(saturnMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0xDAF7A6)
    sunObject.add(orbit)

    // Saturn Ring
    {
        let materialR = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
        })
        let ringMesh = new THREE.Mesh(new THREE.RingGeometry(2.5, 3.0, 30), materialR)
        ringMesh.castShadow = true
        ringMesh.position.set(0, 0, 0)
        ringMesh.rotation.x = Math.PI / 2.2

        saturnMesh.add(ringMesh)
    }

    // Planet's pivor for the moon
    let saturnPivot = new THREE.Object3D()
    saturnMesh.add(saturnPivot)

    // Titan moon
    {
        let material = new THREE.MeshPhongMaterial({ map: titanTexture })
        let titanMoon = createMoon(0.2, material)
        titanMoon.position.x = 4.0

        moons.push(titanMoon)

        saturnPivot.add(titanMoon)
    }

    moons.push(saturnPivot)

    // Planet's object with all its data
    let saturn = {
        mesh: saturnMesh,
        obj: pivotPoint,
        orbitSpeed: (6.13 * Math.pow(10, -3)),
        rotation: 0.022,
    }

    planets.push(saturn)

}


/**
 * Initializes Uranus object
 * Recevies the loaded texture
 */
function initUranus(texture) {

    let radius = 0.75
    let distance = 52

    let material = new THREE.MeshPhongMaterial({ map: texture })

    let uranusMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material)
    uranusMesh.position.set(distance, 0, 0)
    uranusMesh.rotation.z = Math.PI * 0.544

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(uranusMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0x03D1F1)
    sunObject.add(orbit)

    // Planet's object with its data
    let uranus = {
        mesh: uranusMesh,
        obj: pivotPoint,
        orbitSpeed: (4.3 * Math.pow(10, -3)),
        rotation: -0.035,
    }

    planets.push(uranus)

}


/**
 * Initializes Neptune object
 * Recevies the loaded texture
 */
function initNeptune(texture) {

    let radius = 0.8
    let distance = 57

    let material = new THREE.MeshPhongMaterial({ map: texture })

    let neptuneMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material)
    neptuneMesh.position.set(distance, 0, 0)
    neptuneMesh.rotation.z = Math.PI * 0.155

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(neptuneMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0x846AA8)
    sunObject.add(orbit)

    // Planet's object with its data
    let neptune = {
        mesh: neptuneMesh,
        obj: pivotPoint,
        orbitSpeed: (3.41 * Math.pow(10, -3)),
        rotation: 0.033,
    }

    planets.push(neptune)

}


/**
 * Initializes Neptune object
 * Recevies the loaded texture
 */
function initPluto(texture) {

    let radius = 0.09
    let distance = 63


    let material = new THREE.MeshPhongMaterial({ map: texture })

    let plutoMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material)
    plutoMesh.position.set(distance, 0, 0)
    plutoMesh.rotation.z = Math.PI * 0.677

    // Pivot for the movement around the Sun
    let pivotPoint = new THREE.Object3D()
    sunObject.add(pivotPoint)
    pivotPoint.add(plutoMesh)

    // Draw the orbit
    let orbit = createOrbit(distance, 0x616A6B)
    sunObject.add(orbit)

    // Planet's object with its data
    let pluto = {
        mesh: plutoMesh,
        obj: pivotPoint,
        orbitSpeed: (2.97 * Math.pow(10, -3)),
        rotation: -0.319,
    }

    planets.push(pluto)

}


/**
 * Creates a moon object
 * Receives the radius of the sphere and the material
 * Returns the mesh 
 */
function createMoon(radius, material) {

    let geometry = new THREE.SphereGeometry(radius, 32, 32)
    let moonMesh = new THREE.Mesh(geometry, material)
    moonMesh.castShadow = true
    return moonMesh

}


/**
 * Creates the orbit of an object
 * Receives the radius of the orbit and the color
 * Returns the circle-line object
 */
function createOrbit(distance, color) {

    let material = new THREE.LineBasicMaterial({ color: color, linewidth: 4 })
    let circGeom = new THREE.CircleGeometry(distance, 50)

    circGeom.vertices.shift()

    let circ = new THREE.LineLoop(circGeom, material)

    circ.rotation.x = Math.PI / 2

    return circ

}


/**
 * Generates random float in a range
 * Receives the inclusive min and exclusive max limit
 */
function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min)
}

/**
 * Resizes the canvas when window is changed
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}