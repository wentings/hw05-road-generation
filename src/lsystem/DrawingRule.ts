import { vec3, mat4, quat } from 'gl-matrix';
import Turtle from "./turtle";

export default class DrawingRule {
  lsys: Turtle = new Turtle(vec3.fromValues(0, 0, 0),
                            vec3.fromValues(0, 1, 0),
                            quat.fromValues(0, 0, 0, 1));
    // Pass in a drawing function
    constructor(turtle: Turtle) {
      this.lsys = turtle;
    }

    draw(rand : number, currentChar : string) : any {
      // Get a random number
      // let rand = Math.random();

      // List of possible drawing rules thus far:
      // F: move forward a certain distance and draw (e.g. 10 pixels)
      // +: turn left 30 degrees
      // -: turn right 30 degrees
      // [: push turtle
      // ]: pop turtle

      if (currentChar == "F") {
        return this.lsys.moveForward();
      } else if (currentChar == "+") {
        return this.lsys.rotateLeft();
      } else if (currentChar == "-") {
        return this.lsys.rotateRight();
      }
    }
}
