export class TurnHandler {
    constructor() {
      this.turnsLeft = null;
      this.rollsLeft = null;
      this.totalTurns = null;
      this.rollsPerTurn = null;
    }
  
    init(){
      this.turnsLeft = this.totalTurns;
      this.rollsLeft = this.rollsPerTurn;
    }

    useRuleset({totalTurns, rollsPerTurn}){
      this.totalTurns = totalTurns;
      this.rollsPerTurn = rollsPerTurn;
    }

    nextTurn() {
      if (this.turnsLeft > 0) {
        this.turnsLeft--;
        this.rollsLeft = this.rollsPerTurn;
      } else {
        throw new Error("No turns left.");
      }
    }
  
    roll() {
      if (this.rollsLeft > 0) {
        this.rollsLeft--;
      } else {
        throw new Error("No rolls left.");
      }
    }
  
    resetRolls() {
      this.rollsLeft = this.rollsPerTurn;
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

    hasRolled(){
      return this.rollsLeft < this.rollsPerTurn;
    }
  }
