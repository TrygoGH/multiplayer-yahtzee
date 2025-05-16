import { Die } from "../models/Die.js";
import { Result } from "../../../utils/Result.js";

export class DiceHandler {
  constructor() {
    this.dice = null;
  }

  init() {
    this.dice = Array(this.numDice).fill(new Die({})); // start all dice as 1
  }

  useRuleset({ numDice = 5, sides = 6 } = {}) {
    this.numDice = numDice;
    this.sides = sides;
  }

  rollDice() {
    this.dice.forEach((die) => {
      if (!die.isHeld) {
        die.value = Math.floor(Math.random() * die.sides) + 1;
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
    this.holdDie(!die.isHeld);

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
