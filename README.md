WebGL fragment shader scaffolding
================================

Scaffolding code for developing WebGL full-screen fragment shaders. Adapted from GLSL sandbox by Ricardo Cobello aka mr.doob: http://ricardocabello.com/blog/post/714.

Example shader: http://vector.io/shaders/terrain.html

Usage:

Create an HTML file with GLSL fragment shader source code defined in a tag like this:
```<script id='fragment-shader' type='x-shader/x-fragment'>```

Optionally define a ```<canvas>``` with ```id='shader-canvas'``` for rendering, otherwise one will be automatically added to the document.

After your shader script tag, include the scaffold file to compile & start the render loop:
```<script src="scaffold.js"></script>```

The fragment shader will be passed a few standard paramters:
- seed: a random number initialized on load
- start_time: epoch time when program started
- time: epoch time for current frame
- resolution: xy resolution of viewport
