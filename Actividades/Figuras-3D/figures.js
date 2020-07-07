/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/


mat4 = glMatrix.mat4

let projectionMatrix, modelViewMatrix


function randColor() {
    let red = "vec4(1.0,0.0,0.0,1.0)"
    let green = "vec4(0.0,1.0,0.0,1.0)"
    let blue = "vec4(0.0,0.0,1.0,1.0)"
    let magenta = "vec4(1.0,0.0,1.0,1.0)"

    let arr = [red, green, blue, magenta]
    let color = arr[Math.floor(Math.random() * arr.length)]
    return color
}

let vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "    }\n"

let fragmentShaderSource =
    "    void main(void) {\n" +
    "    // Return the pixel color: always output white\n" +
    `    gl_FragColor = ${randColor()};\n` +
    "}\n";

let shaderProgram, shaderVertexPositionAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform


function initWebGL(canvas) {

    let gl = null
    let msg = "Your browser does not support WebGL, or it is not enabled by default."

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

function initGL(gl, canvas) {

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)


    modelViewMatrix = mat4.create()
    mat4.identity(modelViewMatrix)

    projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix, Math.PI / 3, canvas.width / canvas.height, 1, 10000)
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height)
}

function initShader(gl) {

    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment")
    let vertexShader = createShader(gl, vertexShaderSource, "vertex")


    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)


    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos")
    gl.enableVertexAttribArray(shaderVertexPositionAttribute)


    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix")
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix")

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders")
    }

}

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

function draw(gl, obj) {

    gl.useProgram(shaderProgram)

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer)

    gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0)

    gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix)
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix)


    gl.drawArrays(obj.primtype, 0, obj.nVerts)

}

function createSquare(gl) {

    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    let verts = [
        .5, .5, 0.0,
        -.5, .5, 0.0,
        .5, -.5, 0.0,
        -.5, -.5, 0.0,
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)


    let square = { buffer: vertexBuffer, vertSize: 3, nVerts: 4, primtype: gl.TRIANGLE_STRIP }
    return square

}

function createTriangle(gl) {

    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    let verts = [
        0.0, 0.5, 0.0,
        .5, -.5, 0.0,
        -.5, -.5, 0.0
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)


    let triangle = { buffer: vertexBuffer, vertSize: 3, nVerts: 3, primtype: gl.TRIANGLES }
    return triangle

}

function createPacman(gl) {

    let vertexBuffer
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    let points = [0.0, 0.0]
    let mouthAngle = Math.PI / 7
    const r = 0.6

    for (let i = 0; i <= 150; i++) {
        points.push((r * Math.cos(i * 2 * Math.PI / 180 + mouthAngle)))
        points.push((r * Math.sin(i * 2 * Math.PI / 180 + mouthAngle)))
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    let pacman = { buffer: vertexBuffer, vertSize: 2, nVerts: points.length / 2, primtype: gl.TRIANGLE_FAN }
    return pacman

}

function createCircle(gl, r) {

    let vertexBuffer
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    let points = [0.0, 0.0]

    for (let i = 0; i <= 180; i++) {
        points.push((r * Math.cos(i * 2 * Math.PI / 180)))
        points.push((r * Math.sin(i * 2 * Math.PI / 180)))
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);


    let circle = { buffer: vertexBuffer, vertSize: 2, nVerts: points.length / 2, primtype: gl.TRIANGLE_FAN }
    return circle

}



