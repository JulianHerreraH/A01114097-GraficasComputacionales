/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/


let mat4 = glMatrix.mat4

let projectionMatrix

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform

let duration = 5000 // ms

// Source for the vertex shader
let vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// Source for the fragment shader
let fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";


/**
 * WebGL initialisation
 * Receives the HTML canvas element
 * Returns the webGL context
 */
function initWebGL(canvas) {
    let gl = null
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default."
    try {
        gl = canvas.getContext("experimental-webgl")
    }
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString()
    }

    if (!gl) {
        alert(msg)
        throw new Error(msg)
    }

    return gl
}

/**
 * WebGL viewport sizing
 * Receives the HTML canvas element and webGL object
 */
function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height)
}

/**
 * WebGL projection matrix creation
 * Receives the HTML canvas element
 */
function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -10])
}


/**
 * Creates a pyramid with a pentagonal base
 * Receives the gl object and translation and rotation axes
 * Returns a pyramid object
 */
function createPyramid(gl, translation, rotationAxis) {

    // Vertex Data
    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    const t = (1 + Math.sqrt(5)) / 2 // Golden ratio = 1.618

    // Vertices definition
    verts = [
        0, -1, -t, // 0
        -t, -1, -1, // 1
        t, -1, -1, // 2

        -t, -1, -1, // 1
        -1, -1, 1, // 3
        1, -1, 1, // 4

        -t, -1, -1, // 1
        1, -1, 1, // 4
        t, -1, -1, // 2

        0, -1, -t, // 0
        -t, -1, -1, // 1
        0, 1, 0, // 5

        0, -1, -t, // 0
        0, 1, 0, // 5
        t, -1, -1, // 2

        -t, -1, -1, // 1
        -1, -1, 1, // 3
        0, 1, 0, // 5

        t, -1, -1, // 2
        0, 1, 0, // 5
        1, -1, 1, // 4

        0, 1, 0, // 5
        -1, -1, 1, // 3
        1, -1, 1, // 4
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)


    // Color data
    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

    // Colors for each face, repeated for the bottom one
    let faceColors = [
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],

        [0.6, 0.15, 0.7, 1.0],
        [0.55, 0.14, 0.66, 1.0],
        [0.48, 0.12, 0.63, 1.0],
        [0.41, 0.10, 0.6, 1.0],
        [0.29, 0.07, 0.54, 1.0],

    ]
    let vertexColors = []

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++) {
            vertexColors.push(...color)
        }

    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW)


    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer)

    let pyramidIndices = []

    for (let i = 0; i < 24; i++) {
        pyramidIndices.push(i)
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW)


    // Pyramid object
    let pyramid = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: pyramidIndexBuffer,
        vertSize: 3, nVerts: 24, colorSize: 4, nColors: 24, nIndices: pyramidIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    }

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation)

    pyramid.update = function () {
        let now = Date.now()
        let deltat = now - this.currentTime
        this.currentTime = now
        let fract = deltat / duration
        let angle = Math.PI * 2 * fract

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis)
    }

    return pyramid

}


/**
 * Creates a regular dodecahedron
 * Receives the gl object and translation and rotation axes
 * Returns the dodecahedron object
 */
function createDodecahedron(gl, translation, rotationAxis) {

    // Vertex data
    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    const t = (1 + Math.sqrt(5)) / 2 // Golden ratio = 1.618
    const r = 1 / t // r = 0.618

    // Vertices definition
    let verts = [

        // Face 1 
        1, 1, 1, // 0
        0, r, t, // 8
        t, 0, r, // 16***
        0, r, t, // 8
        0, -r, t, // 10
        1, -1, 1, // 2***
        0, r, t, // 8
        t, 0, r, // 16
        1, -1, 1, // 2

        // Face 2
        -1, 1, 1, // 4
        -t, 0, r, // 18
        0, r, t, // 8****
        -t, 0, r, // 18
        -1, -1, 1, // 6
        0, -r, t, // 10*****
        -t, 0, r, // 18
        0, r, t, // 8
        0, -r, t, // 10

        // Face 3
        t, 0, -r, // 17
        t, 0, r, // 16
        1, -1, -1, // 3****
        t, 0, r, // 16
        1, -1, 1, // 2
        r, -t, 0, // 13****
        t, 0, r, // 16
        1, -1, -1, // 3
        r, -t, 0, // 13****

        // Face 4
        -r, t, 0, // 14
        -1, 1, 1, // 4
        r, t, 0, // 12****
        -1, 1, 1, // 4
        0, r, t, // 8
        1, 1, 1, // 0****
        -1, 1, 1, // 4
        r, t, 0, // 12
        1, 1, 1, // 0****

        // Face 5
        1, 1, -1, // 1
        r, t, 0, // 12
        t, 0, -r, // 17****
        r, t, 0, // 12
        1, 1, 1, // 0
        t, 0, r, // 16****
        r, t, 0, // 12
        t, 0, -r, // 17
        t, 0, r, // 16

        // Face 6
        0, -r, t, // 10
        -1, -1, 1, // 6
        1, -1, 1, // 2****
        -1, -1, 1, // 6
        -r, -t, 0, // 15
        r, -t, 0, // 13***
        -1, -1, 1, // 6
        1, -1, 1, // 2
        r, -t, 0, // 13

        // Face 7
        -r, t, 0, // 14
        -1, 1, 1, // 4
        -1, 1, -1, // 5***
        -1, 1, 1, // 4
        -t, 0, r, // 18
        -t, 0, -r, // 19****
        -1, 1, 1, // 4
        -1, 1, -1, // 5
        -t, 0, -r, // 19

        // Face 8
        -t, 0, -r, // 19
        -t, 0, r, // 18
        -1, -1, -1, // 7****
        -t, 0, r, // 18
        -1, -1, 1, // 6
        -r, -t, 0, // 15****
        -t, 0, r, // 18
        -1, -1, -1, // 7
        -r, -t, 0, // 15

        // Face 9
        0, -r, -t, // 11
        -1, -1, -1, // 7
        1, -1, -1, // 3***
        -1, -1, -1, // 7
        -r, -t, 0, // 15
        r, -t, 0, // 13****
        -1, -1, -1, // 7
        1, -1, -1, // 3
        r, -t, 0, // 13

        // Face 10
        -1, 1, -1, // 5
        -t, 0, -r, // 19
        0, r, -t, // 9****
        -t, 0, -r, // 19
        -1, -1, -1, // 7
        0, -r, -t, // 11****
        -t, 0, -r, // 19
        0, r, -t, // 9
        0, -r, -t, // 11

        // Face 11
        r, t, 0, // 12
        -r, t, 0, // 14
        1, 1, -1, // 1****
        -r, t, 0, // 14
        -1, 1, -1, // 5
        0, r, -t, // 9***
        -r, t, 0, // 14
        1, 1, -1, // 1
        0, r, -t, // 9

        // Face 12
        1, 1, -1, // 1
        0, r, -t, // 9
        t, 0, -r, // 17****
        0, r, -t, // 9
        0, -r, -t, // 11
        1, -1, -1, // 3***
        0, r, -t, // 9
        t, 0, -r, // 17
        1, -1, -1, // 3

    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)


    // Color data
    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

    // Color definition for each face
    let faceColors = [
        [0.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [0.3, 0.5, 0.6, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.5, 0.0, 1.0],

        [0.5, 1.0, 0.5, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],

        [1.0, 1.0, 0.5, 1.0],
        [0.8, 0.4, 1.0, 1.0],
        [0.9, 0.5, 0.2, 1.0],
    ]

    let vertexColors = []

    faceColors.forEach(color => {
        for (let j = 0; j < 9; j++) {
            vertexColors.push(...color)
        }
    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW)


    // Index data (defines the triangles to be drawn).
    let dodecahedronIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer)

    let dodecahedronIndices = []
    for (let i = 0; i < 108; i++) {
        dodecahedronIndices.push(i)
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW)


    // Dodecahedron object
    let dodecahedron = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: dodecahedronIndexBuffer,
        vertSize: 3, nVerts: 108, colorSize: 4, nColors: 108, nIndices: dodecahedronIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    }

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation)

    dodecahedron.update = function () {
        let now = Date.now()
        let deltat = now - this.currentTime
        this.currentTime = now
        let fract = deltat / duration
        let angle = Math.PI * 2 * fract

        // Get the two rotation points
        const point1 = rotationAxis[0]
        const point2 = rotationAxis[1]


        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, point1)
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, point2)
    }

    return dodecahedron

}


/**
 * Creates an octahedron
 * Receives the gl object and translation and rotation axes
 * Returns the octahedron
 */
function createOctahedron(gl, translation, rotationAxis) {

    // Vertex data
    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    // Vertices definition
    let verts = [
        //------------Top Pyramid----------//

        // Front face
        -1.0, 0.0, 1.0, // Index 0
        1.0, 0.0, 1.0, // Index 1
        0.0, 1.5, 0.0, // Index 2

        // Back
        -1.0, 0.0, -1.0, // Index 3
        1.0, 0.0, -1.0, // Index 4
        0.0, 1.5, 0.0, // Index 5

        // Right face
        1.0, 0.0, -1.0, // Index 6
        1.0, 0.0, 1.0, // Index 7
        0.0, 1.5, 0.0, // Index 8

        // Left face
        -1.0, 0.0, -1.0, // 9
        -1.0, 0.0, 1.0, // 10
        0.0, 1.5, 0.0, // 11

        //------------Bottom Pyramid----------//

        // Front
        -1.0, 0.0, 1.0, // Index 12
        1.0, 0.0, 1.0, // Index 13
        0.0, -1.5, 0.0, // Index 14

        // Back
        -1.0, 0.0, -1.0, // Index 15
        1.0, 0.0, -1.0, // Index 16
        0.0, -1.5, 0.0, // Index 17

        // Right face
        1.0, 0.0, -1.0, // Index 18
        1.0, 0.0, 1.0, // Index 19
        0.0, -1.5, 0.0, // Index 20

        // Left face
        -1.0, 0.0, -1.0, // 21
        -1.0, 0.0, 1.0, // 22
        0.0, -1.5, 0.0, // 23
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)


    // Color data
    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    let faceColors = [
        [1.0, 0.0, 0.5, 1.0],
        [0.0, 0.5, 1.0, 1.0],
        [0.6, 1.0, 0.1, 1.0],
        [0.0, 1.0, 0.5, 1.0],

        [0.0, 1.0, 0.5, 1.0],
        [0.6, 1.0, 0.1, 1.0],
        [0.0, 0.5, 1.0, 1.0],
        [1.0, 0.0, 0.5, 1.0],
    ]

    let vertexColors = []

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++) {
            vertexColors.push(...color)
        }
    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW)


    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer)

    let octahedronIndices = []

    for (let i = 0; i < 24; i++) {
        octahedronIndices.push(i)
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW)


    // Octahedron object
    let octahedron = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: octahedronIndexBuffer,
        vertSize: 3, nVerts: 24, colorSize: 4, nColors: 24, nIndices: octahedronIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now(), isDown: true
    }

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation)


    octahedron.update = function () {
        let now = Date.now()
        let deltat = now - this.currentTime
        this.currentTime = now
        let fract = deltat / duration
        let angle = Math.PI * 2 * fract

        // Movement speed for the object
        let move = fract * 6.0


        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis)

        // If it touches the top, go down
        if (this.modelViewMatrix[13] >= 3.4) {
            this.isDown = true
        }
        else if (this.modelViewMatrix[13] <= -3.4) {
            this.isDown = false
        }


        if (this.isDown) {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, -move, 0]) // Move down
        } else {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, +move, 0]) // Move up
        }

    }

    return octahedron

}


/**
 * Creation  and compilation of the shaders
 * Receives the gl object, shader's source and type
 * Returns the shader
 */
function createShader(gl, str, type) {
    let shader
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
        return null
    }

    gl.shaderSource(shader, str)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))
        return null
    }

    return shader
}


/**
 * Initializes shaders and gets pointers
 * Receives the gl object 
 */
function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment")
    let vertexShader = createShader(gl, vertexShaderSource, "vertex")

    // link them together into a new program
    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos")
    gl.enableVertexAttribArray(shaderVertexPositionAttribute)

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor")
    gl.enableVertexAttribArray(shaderVertexColorAttribute)

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix")
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix")

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders")
    }
}


/**
 * Draws the figures 
 * Receives the gl object and the objects to draw
 */
function draw(gl, objs) {

    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    // set the shader to use
    gl.useProgram(shaderProgram)

    for (i = 0; i < objs.length; i++) {
        obj = objs[i]
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer)
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer)
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0)


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices)

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix)
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix)

        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }

}


/**
 * Main loop function, drawns and updates the objects
 * Receives the gl object and the objects 
 */
function run(gl, objs) {

    requestAnimationFrame(function () { run(gl, objs) })

    draw(gl, objs)

    for (i = 0; i < objs.length; i++)
        objs[i].update()

}