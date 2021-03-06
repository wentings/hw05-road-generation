import { vec3, mat4, quat } from 'gl-matrix';
import Turtle from './Turtle';
import DrawingRule from './DrawingRule';
import ExpansionRule from './ExpansionRule';

// TODO: ask about the LSystem structure
let rand1 : number = Math.random();
let rand2 : number = Math.random();
let rand3 : number = Math.random();
export default class LSystem {
  turtle: Turtle = new Turtle(vec3.fromValues(rand1 * 3, rand2 * 3,
                                rand3 * 3),
                               vec3.fromValues(1, 0, 0),
                               quat.fromValues(0, 0, 0, 1)); // Current turtle
    turtleHistory: Turtle[] = []; // Stack of turtle history
    dr: DrawingRule = new DrawingRule(this.turtle); // Map of drawing rules
    er: ExpansionRule = new ExpansionRule();
    grammar: string;
    transformHistory: mat4[] = [];
    leafHistory: mat4[] = [];
    // tempTransform: mat4;
    // this.transformHistory.push(tempTransform);

    constructor(axiom: string) {
        this.grammar = axiom;
    }

    // [
    pushState() {
      console.log("push state");
      let newPos: vec3 = vec3.create();
      vec3.copy(newPos, this.turtle.position);

      let newOri: vec3 = vec3.create();
      vec3.copy(newOri, this.turtle.direction);

      let newQuat: quat = quat.create();
      quat.copy(newQuat, this.turtle.quaternion);

      let temp: Turtle = new Turtle(newPos,
                                    newOri,
                                    newQuat);
      console.log("pushing " + temp.position[0] + " " + temp.position[1]
                  + " " + temp.position[2]);
      this.turtleHistory.push(temp);
      console.log("there are " + this.turtleHistory.length + " on turtle stack");
    }
    // ]
    popState(){
      console.log("pop state");
        console.log("before pop there are " + this.turtleHistory.length + " on turtle stack");
        var s: Turtle = this.turtleHistory.pop();
        console.log("popping " + s.position[0] + " " + s.position[1]
                    + " " + s.position[2]);
        console.log("after pop there are " + this.turtleHistory.length + " on turtle stack");
        this.turtle.position = s.position,
        this.turtle.direction = s.direction;
        this.turtle.quaternion = s.quaternion;
    }

    expandGrammarSingle(str: string) : string {
        // Use the expansion rules
        let rand: number = Math.random();
        var result = "";
        result = this.er.expand(rand, str); // this expands a single char into something
        return result;
    }

    // Iterate over each char in the axiom and replace it with its expansion
    expandGrammar(texWidth: number, texHeight:number, str: string) : string {
        console.log("Text width " + texWidth);
        console.log("Text height " + texHeight);
        var output = this.grammar;
        let temp: vec3 = vec3.create();
        temp = this.turtle.position;
        for (var i = 0; i < 200; i++) {
          for (var j = 0; j < str.length; j++) {
            console.log("current x" + temp[0]);
            console.log("current y" + temp[1]);
            output = output.concat(this.expandGrammarSingle(str.charAt(j)));
          }
        }
        return output;
    }

    drawGrammarSingle(str: string) : void {
        // Use the expansion rules
        let rand: number = Math.random();
        var result = "";
        if (str == "F") {
          let transMat : any = this.turtle.getMatrix();
          this.transformHistory.push(transMat);
        }
        if (str == "[") {
          this.pushState();
        }
        else if (str == "]") {
          this.popState();
        }
        else {
          let func = this.dr.draw(rand, str);
          if (func) {
            func();
          }
        }
    }

    drawGrammar(str: string) : void {
      for (var j = 0; j < str.length; j++) {
        this.drawGrammarSingle(str.charAt(j));
      }
    }
}
