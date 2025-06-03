import { CATEGORY_BASE_SCORES } from "../constants/Catagories.js";

export class GameRules {
    constructor({
      maxPlayers = 4,
      totalTurns = 13,
      rollsPerTurn = 3,
      totalDice = 5,
      categoryBaseScores = CATEGORY_BASE_SCORES
    } = {}) {
      this.maxPlayers = maxPlayers;
      this.totalTurns = totalTurns;
      this.rollsPerTurn = rollsPerTurn;
      this.totalDice = totalDice;
      this.categoryBaseScores = categoryBaseScores;
    }
  }
  