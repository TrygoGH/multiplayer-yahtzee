import { Die } from "../models/Die.js";

export class DiceHandler {
    constructor(numDice = 5, sides = 6) {
      this.numDice = numDice;
      this.sides = sides;
      this.dice = Array(numDice).fill(new Die({})); // start all dice as 1
      this.held = Array(numDice).fill(false); // true if die is held
    }
  
    rollDice() {
      for (let i = 0; i < this.numDice; i++) {
        if (!this.held[i]) {
          this.dice[i] = Math.floor(Math.random() * this.sides) + 1;
        }
      }
    }
  
    holdDice(index, isHeld = true) {
      if (index >= 0 && index < this.numDice) {
        this.held[index] = isHeld;
      }
    }
  
    resetHeld() {
      this.held.fill(false);
    }
  
    getDice() {
      return [...this.dice]; // prevent external mutation
    }
  
    getHeld() {
      return [...this.held];
    }
  }
  