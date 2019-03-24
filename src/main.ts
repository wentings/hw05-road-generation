import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Show population': false,
  'Show terrain elevation': false,
  'Show land vs. water': false,
};

let square: Square;
let screenQuad: ScreenQuad;
let background: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  background = new ScreenQuad();
  screenQuad.create();
  background.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
   let colorsArray = [];
   let col1Array = [];
   let col2Array = [];
   let col3Array = [];
   let col4Array = [];

  //  var lsys = new LSystem();
  // var x = lsys.expandGrammar(iterations, lsys.grammar);
  // let transformations: mat4[] = lsys.transformHistory;

  let n: number = 1.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {

      let currTransform = [10.0, 0.0, 0.0, 0.0,
                            0.0, 10.0, 0.0, 0.0,
                          0.0, 0.0, 10.0, 0.0,
                          0.0, 0.0, 0.0, 1.0];

      // Dummy - todo, get rid of offsets
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      // push column vectors back
      col1Array.push(currTransform[0]);
      col1Array.push(currTransform[1]);
      col1Array.push(currTransform[2]);
      col1Array.push(currTransform[3]);

      col2Array.push(currTransform[4]);
      col2Array.push(currTransform[5]);
      col2Array.push(currTransform[6]);
      col2Array.push(currTransform[7]);

      col3Array.push(currTransform[8]);
      col3Array.push(currTransform[9]);
      col3Array.push(currTransform[10]);
      col3Array.push(currTransform[11]);

      col4Array.push(currTransform[12]);
      col4Array.push(currTransform[13]);
      col4Array.push(currTransform[14]);
      col4Array.push(currTransform[15]);

      // push colors back
      let rand: number = Math.random();
      colorsArray.push(0.1);
      colorsArray.push(1.0 * 0.6);
      colorsArray.push(0.1);
      colorsArray.push(1.0);
    }
  }
    let col1: Float32Array = new Float32Array(col1Array);
    let col2: Float32Array = new Float32Array(col2Array);
    let col3: Float32Array = new Float32Array(col3Array);
    let col4: Float32Array = new Float32Array(col4Array);
    let colors: Float32Array = new Float32Array(colorsArray);
    let offset: Float32Array = new Float32Array(offsetsArray);
  square.setInstanceVBOs(offset, colors, col1, col2, col3, col4);
  square.setNumInstances(n * n); // grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Show population');
  gui.add(controls, 'Show terrain elevation');
  gui.add(controls, 'Show land vs. water');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const mapShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/map-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/map-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    mapShader.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    // Pass user input to shaders
    if (controls["Show population"]) {
      mapShader.setShowPopulation(1.0);
    } else {
      mapShader.setShowPopulation(0.0);
    }

    if (controls["Show terrain elevation"]) {
      mapShader.setShowTerrainGradient(1.0);
    } else {
      mapShader.setShowTerrainGradient(0.0);
    }

    if (controls["Show land vs. water"]) {
      mapShader.setShowTerrainBinary(1.0);
    } else {
      mapShader.setShowTerrainBinary(0.0);
    }


    //renderer.render(camera, flat, [screenQuad]);
    //renderer.render(camera, flat, [background]);
    renderer.render(camera, mapShader, [square]);
    // renderer.render(camera, instancedShader, [
    //   square,
    // ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
