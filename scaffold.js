/*
Scaffolding code for developing WebGL full-screen fragment shaders
Adapted from GLSL sandbox by Ricardo Cobello aka mr.doob: http://ricardocabello.com/blog/post/714

Usage:

Create an HTML file with GLSL fragment shader source code defined in a tag like this:
<script id='fragment-shader' type='x-shader/x-fragment'>

Optionally define a <canvas> with id='shader-canvas' for rendering, otherwise one will be automatically added to the document.

After your shader script tag, include the scaffold file to compile & start the render loop:
<script src="scaffold.js"></script>

The fragment shader will be passed a few standard paramters:
    seed: a random number initialized on load
    start_time: epoch time when program started
    time: epoch time for current frame
    resolution: xy resolution of viewport
*/

(function () {
"use strict";

// GL building blocks
var canvas, gl, program, buffer;

// Sent to shader each frame
var seed = Math.random();
var start_time = new Date().getTime();

// Default vertex shader to use if not defined by main program
var default_vertex_shader_source = "attribute vec3 position; void main() { gl_Position = vec4( position, 1.0 ); }";

// Setup WebGL and compile shaders/program
function init()
{
    var vertex_shader_source, fragment_shader_source;
    var vertex_position;

    vertex_shader_source = document.getElementById('vertex-shader');
    vertex_shader_source = (vertex_shader_source && vertex_shader_source.textContent) || default_vertex_shader_source;

    if (document.getElementById('fragment-shader') == null) {
        throw "Fragment shader source must be in a <script> tag with id='fragment-shader'";
    }
    fragment_shader_source = document.getElementById('fragment-shader').textContent;

    canvas = document.getElementById('shader-canvas');
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.id = 'shader-canvas';
        document.body.appendChild(canvas);
    }

    gl = canvas.getContext('experimental-webgl');
    if (!gl) {
        throw "Couldn't create WebGL context";
    }

    // Create Program
    program = createProgram(vertex_shader_source, fragment_shader_source);
    gl.useProgram(program);

    // Create vertex buffer (2 triangles covering whole viewport)
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
            -1.0,  1.0
        ]),
        gl.STATIC_DRAW
    );

    vertex_position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(vertex_position);
    gl.vertexAttribPointer(vertex_position, 2, gl.FLOAT, false, 0, 0);

    window.onresize = onWindowResize;
    onWindowResize();

    // Start animation loop
    frame();
}

// Compile & link a WebGL program from provided vertex and shader source
function createProgram (vertex_shader_source, fragment_shader_source)
{
    var program = gl.createProgram();

    var vertex_shader = createShader(vertex_shader_source, gl.VERTEX_SHADER);
    var fragment_shader = createShader('#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);

    if (vertex_shader == null || fragment_shader == null) {
        return null;
    }

    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);

    gl.deleteShader(vertex_shader);
    gl.deleteShader(fragment_shader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var program_error =
            "WebGL program error:\n" +
            "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
            "ERROR: " + gl.getError() + "\n\n" +
            "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" +
            "--- Fragment Shader ---\n" + fragment_shader_source;
        throw program_error;
    }

    return program;
}

// Compile a vertex or fragment shader from provided source
function createShader (source, type)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var shader_error =
            "WebGL shader error:\n" +
            (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" +
            gl.getShaderInfoLog(shader);
        throw shader_error;
    }

    return shader;
}

// Resize WebGL viewport to window
function onWindowResize (event)
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Cross-browser compatibility for requestAnimationFrame
(function requestAnimationFrameCompatibility ()
{
  if (window.requestAnimationFrame == undefined) {
      window.requestAnimationFrame =
          (function () {
              return (
                  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  window.oRequestAnimationFrame      ||
                  window.msRequestAnimationFrame     ||
                  function (callback) {
                      window.setTimeout(callback, 1000 / 60);
                  }
              );
          })();
  }
}());

// Animation loop
function frame () {
    render();
    requestAnimationFrame(frame);
}

function render() {
    if (!program) {
        return;
    }

    // Set values to program variables
    gl.uniform1f(gl.getUniformLocation(program, 'seed'), seed);
    gl.uniform1f(gl.getUniformLocation(program, 'start_time'), start_time / 1000);
    gl.uniform1f(gl.getUniformLocation(program, 'time'), ((new Date().getTime()) - start_time) / 1000);
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);

    // Render geometry
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

init();

}());
