let canvas;
let container;
let shaderPath;

let gl = null;
let shaderProgram;
let resolutionLocation;
let vertexArray = new Float32Array;


const resizeCanvas = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (gl != null) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    }
}


const compileShader = (code, type) => {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(
            `Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"
            } shader:`,
        );
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}


const buildShaderProgram = (shaderInfo) => {
    const program = gl.createProgram();

    shaderInfo.forEach((desc) => {
        const shader = compileShader(desc.code, desc.type);

        if (shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error linking shader program:");
        console.log(gl.getProgramInfoLog(program));
    }

    return program;
};


const getBackgroundColor = () => {
    rgbString = getComputedStyle(container).getPropertyValue('background-color');
    let color = rgbString
        .slice(4, -1)
        .split(",")
        .map(a => a.trim())
        .map(a => parseInt(a, 10));
    return color;
};


window.addEventListener("DOMContentLoaded", async () => {
    canvas = document.querySelector("#shader");
    if (!canvas) return;
    shaderPath = canvas.getAttribute("data-shader");
    container = document.querySelector(".header");

    new ResizeObserver((entires) => {
        for (const entry of entires) {
            resizeCanvas();
        }
    }).observe(container);

    gl = canvas.getContext("webgl2");
    if (!gl) return;

    const vertex = document.querySelector('script[type="x-shader/x-vertex"]');
    const fragment = document.querySelector('script[type="x-shader/x-fragment');
    if (!vertex || !fragment) return;

    shaderProgram = buildShaderProgram([
        {
            type: gl.VERTEX_SHADER,
            code: await getShaderSource(vertex.src)
        },
        {
            type: gl.FRAGMENT_SHADER,
            code: await getShaderSource(fragment.src)
        }
    ]);

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    const timeLocation = gl.getUniformLocation(shaderProgram, "u_time");
    const backgroundLocation = gl.getUniformLocation(shaderProgram, "u_background_color");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Create a buffer to put three 2d clip space points in
    const positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // fill it with a 2 triangles that cover clip space
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  // first triangle
        1, -1,
        -1, 1,
        -1, 1,  // second triangle
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,          // 2 components per iteration
        gl.FLOAT,   // the data is 32bit floats
        false,      // don't normalize the data
        0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
        0,          // start at the beginning of the buffer
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    const pa = getBackgroundColor();
    gl.uniform3f(backgroundLocation, pa[0] / 255.0, pa[1] / 255.0, pa[2] / 255.0);

    let timeTracker = 0.0;
    let startTime = document.timeline.currentTime;

    function render() {
        timeTracker = (document.timeline.currentTime - startTime) * 0.001;

        gl.uniform1f(timeLocation, timeTracker);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        window.requestAnimationFrame(render);
    }

    render();
});
