import { vec3 } from 'gl-matrix';

export default class ExpansionRule {
  constructor() {

  }

  expand(rand : number, currentChar : string) : string {
    // Get a random number
    // let rand = Math.random();
   if (currentChar == "F"){
     if (rand < 0.80) {
          // should keep moving forward
          return "FFFFFF";
        } else {
          // should rotate some way and keep going this way
          return "F[+FFF";
        }
   }
  }
}
