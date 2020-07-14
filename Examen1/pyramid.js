let projectionMatrix = null, shaderProgram = null;

let shaderVertexPositionAttribute = null, shaderVertexColorAttribute = null, shaderProjectionMatrixUniform = null, shaderModelViewMatrixUniform = null;

let mat4 = glMatrix.mat4;

let duration = 10000;

// Array to store the calculated vertices for the sierpinski pyramid
let vertices = []
// Array to store the colors for the vertices
let colors = []

let vertexShaderSource = `
attribute vec3 vertexPos;
attribute vec4 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;

void main(void) {
    // Return the transformed and projected vertex value
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
    // Output the vertexColor in vColor
    vColor = vertexColor;
}`;

let fragmentShaderSource = `
    precision lowp float;
    varying vec4 vColor;

    void main(void) {
    // Return the pixel color: always output white
    gl_FragColor = vColor;
}
`;

function createShader(gl, str, type) {
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function initWebGL(canvas) {
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);

}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);



    for (obj of objs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function createPyramid(gl, translation, rotationAxis) {

    // Initial points of the pyramid
    let a = [0, 1, 0]
    let b = [1, 0, 0]
    let c = [-0.5, 0, 1]
    let d = [-0.5, 0, -1]

    // recursive function call, three steps
    sierpinski(a, b, c, d, 3)

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Uses the global array: vertices
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Color data
    let vertexColors = [];

    // uses the global array: colors
    // change to one dimentional array 
    colors.forEach(color => {
        vertexColors.push(...color);
    });

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = []

    // the indices can be defined continuously 
    for (let i = 0; i < (vertices.length / 3); i++) {
        pyramidIndices.push(i)
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);


    let pyramid = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: pyramidIndexBuffer,
        vertSize: 3, nVerts: vertices.length / 3, colorSize: 4, nColors: vertexColors.length / 4, nIndices: pyramidIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);
    mat4.rotate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, Math.PI / 8, [1, 0, 0]);

    console.log(pyramid)
    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

// create a triangle with random color
function createTriangle(a, b, c, color) {

    // random between 0-1 with two decimals
    let r1 = Math.random().toFixed(2)
    let g1 = Math.random().toFixed(2)
    let b1 = Math.random().toFixed(2)

    let r2 = Math.random().toFixed(2)
    let g2 = Math.random().toFixed(2)
    let b2 = Math.random().toFixed(2)

    // array of random colors for the faces of the triangles 
    let faceColors = [
        [r1, g2, b2, 1.0],
        [r2, g1, b1, 1.0],
        [r1, g1, b2, 1.0],
        [r2, g2, b1, 1.0],
    ]

    // push the colors and the vertices for the triangle
    colors.push(faceColors[color])
    vertices.push(a[0])
    vertices.push(a[1])
    vertices.push(a[2])

    colors.push(faceColors[color])
    vertices.push(b[0])
    vertices.push(b[1])
    vertices.push(b[2])

    colors.push(faceColors[color])
    vertices.push(c[0])
    vertices.push(c[1])
    vertices.push(c[2])

}

// Find midpoint on the figure's edge
function findMidPoint(a, b) {

    let point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]

    return point

}

// recursive function. base case when the step is zero, draws the 4 faces that compose a pyramid
function sierpinski(a, b, c, d, step) {

    if (step == 0) {

        createTriangle(a, c, b, 0)
        createTriangle(a, c, d, 3)
        createTriangle(a, b, d, 1)
        createTriangle(b, c, d, 2)

    } else {

        let ab = findMidPoint(a, b)
        let ac = findMidPoint(a, c)
        let ad = findMidPoint(a, d)
        let bc = findMidPoint(b, c)
        let bd = findMidPoint(b, d)
        let cd = findMidPoint(c, d)

        let stepR = step - 1

        sierpinski(a, ab, ac, ad, stepR)
        sierpinski(ab, b, bc, bd, stepR)
        sierpinski(ac, bc, c, cd, stepR)
        sierpinski(ad, bd, cd, d, stepR)

    }

}

function update(glCtx, objs) {
    requestAnimationFrame(() => update(glCtx, objs));

    draw(glCtx, objs);
    objs.forEach(obj => obj.update())
}

function main() {
    let canvas = document.getElementById("pyramidCanvas");
    let glCtx = initWebGL(canvas);


    initViewport(glCtx, canvas);
    initGL(glCtx, canvas);

    let pyramid = createPyramid(glCtx, [0, 0, -3.5], [0, 1, 0]);

    initShader(glCtx, vertexShaderSource, fragmentShaderSource);

    update(glCtx, [pyramid]);
}