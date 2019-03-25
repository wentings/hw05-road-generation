import {vec3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import LSystem from './lsystem/LSystem'
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Show population': false,
  'Show terrain elevation': false,
  'Show land vs. water': false,
};

const texWidth = window.innerWidth;
const texHeight = window.innerHeight;

let square: Square;
let square1: Square;
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

 // this sets up the map
   let offsetsArray = [];
   let colorsArray = [];
   let col1Array = [];
   let col2Array = [];
   let col3Array = [];
   let col4Array = [];

  let n: number = 1.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {

      let currTransform = [25.0, 0.0, 0.0, 0.0,
                            0.0, 20.0, 0.0, 0.0,
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
  // ---------------------------------------------------------------

  // this sets up the roads??? how do i get the black to draw
  square1 = new Square();
  square1.create();

  // initialize LSystem and a Turtle to draw
  var lsys = new LSystem("F");
  var x = lsys.expandGrammar(texWidth, texHeight, lsys.grammar);
  let transformations: mat4[] = lsys.transformHistory;
  lsys.drawGrammar(x);
  let offsetsArray_1 = [];
  let colorsArray_1 = [];
  let col1Array_1 = [];
  let col2Array_1 = [];
  let col3Array_1 = [];
  let col4Array_1 = [];

  let m: number = transformations.length;

  for (let i = 0; i < m; i++) {
    let currTransform_1 = transformations[i];

    // Dummy - todo, get rid of offsets
    offsetsArray_1.push(0);
    offsetsArray_1.push(0);
    offsetsArray_1.push(0);

    // push column vectors back
    col1Array_1.push(currTransform_1[0]);
    col1Array_1.push(currTransform_1[1]);
    col1Array_1.push(currTransform_1[2]);
    col1Array_1.push(currTransform_1[3]);

    col2Array_1.push(currTransform_1[4]);
    col2Array_1.push(currTransform_1[5]);
    col2Array_1.push(currTransform_1[6]);
    col2Array_1.push(currTransform_1[7]);

    col3Array_1.push(currTransform_1[8]);
    col3Array_1.push(currTransform_1[9]);
    col3Array_1.push(currTransform_1[10]);
    col3Array_1.push(currTransform_1[11]);

    col4Array_1.push(currTransform_1[12]);
    col4Array_1.push(currTransform_1[13]);
    col4Array_1.push(currTransform_1[14]);
    col4Array_1.push(currTransform_1[15]);

    // push colors back
    colorsArray_1.push(1.0);
    colorsArray_1.push(0.0);
    colorsArray_1.push(0.0);
    colorsArray_1.push(1.0);
  }

  let col1_1: Float32Array = new Float32Array(col1Array_1);
  let col2_1: Float32Array = new Float32Array(col2Array_1);
  let col3_1: Float32Array = new Float32Array(col3Array_1);
  let col4_1: Float32Array = new Float32Array(col4Array_1);
  let colors_1: Float32Array = new Float32Array(colorsArray_1);
  let offset_1: Float32Array = new Float32Array(offsetsArray_1);
  square1.setInstanceVBOs(offset_1, colors_1, col1_1, col2_1, col3_1, col4_1);
  square1.setNumInstances(m);
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


    renderer.render(camera, mapShader, [square]);
    renderer.render(camera, instancedShader, [
      square1,
    ]);
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
