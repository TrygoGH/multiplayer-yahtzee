import Result from "../../../utils/Result.js";

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
      if (!this.turnsLeft > 0) return Result.failure("No turns left");
      
      this.turnsLeft--;
      this.resetRolls();

      return Result.success(this.turnsLeft);
    }
  
    roll() {
      if (!this.rollsLeft > 0) return Result.failure("No rolls left");
      
      this.rollsLeft--;

      return Result.success(this.rollsLeft);
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
