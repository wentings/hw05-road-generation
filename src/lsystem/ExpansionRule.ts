import { vec3 } from 'gl-matrix';

export default class ExpansionRule {
  constructor() {

  }

  expand(rand : number, currentChar : string) : string {
    // Get a random number
    // let rand = Math.random();
    if (currentChar == "F") {
      if (rand < 0.15) {
        return "F[+F-FX][-FX]F";
      } else if (rand < 0.30) {
        return "F[+F-F+F]F";
      } else if (rand < 0.40) {
        return "F[-F+FX]F";
      } else if (rand < 0.60) {
        return "F[-F+FF-FX]F";
      } else if (rand < 0.80) {
        return "F[-F+FF-F+F]F";
      }
    }
  }
}
