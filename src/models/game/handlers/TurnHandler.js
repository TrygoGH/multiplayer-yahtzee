export class TurnHandler {
    constructor(totalTurns = 13, maxRollsPerTurn = 3) {
      this.totalTurns = totalTurns;
      this.maxRollsPerTurn = maxRollsPerTurn;
  
      this.turnsLeft = totalTurns;
      this.rollsLeft = maxRollsPerTurn;
    }
  
    nextTurn() {
      if (this.turnsLeft > 0) {
        this.turnsLeft--;
        this.rollsLeft = this.maxRollsPerTurn;
      } else {
        throw new Error("No turns left.");
      }
    }
  
    useRoll() {
      if (this.rollsLeft > 0) {
        this.rollsLeft--;
      } else {
        throw new Error("No rolls left.");
      }
    }
  
    resetRolls() {
      this.rollsLeft = this.maxRollsPerTurn;
    }
  
    getTurnsLeft() {
      return this.turnsLeft;
    }
  
    getRollsLeft() {
      return this.rollsLeft;
    }
  
    hasTurnsLeft() {
      return this.turnsLeft > 0;
    }
  
    hasRollsLeft() {
      return this.rollsLeft > 0;
    }
  }
  