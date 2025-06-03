import { Die } from "../models/Die.js";
import { Result } from "../../../utils/Result.js";

export class DiceHandler {
  constructor() {
    this.dice = null;
  }

  init() {
    this.dice = [];
    for(let i = 0; i < this.numDice; i++){
      this.dice.push(this.createDie());
    }
    this.rollDice();
  }

  useRuleset({ numDice = 5, sides = 6 } = {}) {
    this.numDice = numDice;
    this.sides = sides;
  }

  createDie(){
    const die = new Die({
        value: 1,
        sides: this.sides,
        isHeld: false,
      });
    return die;
  }

  rollDice() {
    this.dice.forEach((die) => {
      if (!die.isHeld) {
        const value = Math.random() * die.sides;
        die.value = Math.floor(value) + 1;
      }
    })
  }

  holdDie(index, isHeld = true) {
    const isValidDieIndexResult = this.isValidDieIndex(index)
    if (isValidDieIndexResult.isFailure()) return isValidDieIndexResult;

    const die = this.dice[index];
    die.isHeld = isHeld;

    return Result.success(die.isHeld);
  }

  toggleHoldDie(index) {
    const isValidDieIndexResult = this.isValidDieIndex(index)
    if (isValidDieIndexResult.isFailure()) return isValidDieIndexResult;

    const die = this.dice[index];
    this.holdDie(index, !die.isHeld);

    return Result.success(die.isHeld);
  }

  isValidDieIndex(index) {
    const isValid = index >= 0 && index < this.numDice;
    if (!isValid) return Result.failure("Invalid die index");

    return Result.success(index);
  }

  resetHeld() {
    this.dice.forEach((die) => {
      die.isHeld = false;
    })
  }

  getDice() {
    return [...this.dice]; // prevent external mutation
  }

  getDiceValues() {
    const diceValuesArray = [];
    this.dice.forEach(die => {
      diceValuesArray.push(die.value);
    });

    return diceValuesArray;
  }
}
