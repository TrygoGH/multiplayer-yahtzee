import { Scoreboard } from "../models/Scoreboard.js";
import {CATEGORIES} from "../constants/Catagories.js";
import { Result } from "../../../utils/Result.js";

export class ScoreboardHandler {
  constructor() {
    this.scoreboard = null;
    this.init();
  }

  init(){
    this.scoreboard = new Scoreboard();   
  }

  useRuleset(){
    
  }
  /**
   * Attempt to score a category in the actual scoreboard.
   * @param {string} category - The category to score.
   * @param {number} value - The score to assign to that category.
   * @returns {Result} Result indicating success or failure.
   */
  score({category, value}) {
        if (!Object.hasOwn(CATEGORIES, category)) return Result.failure(`Category "${category}" does not exist`);
        if (this.scoreboard.scores[category] !== null) return Result.failure(`Category "${category}" already has a score`);
        if (typeof value !== 'number') return Result.failure(`Invalid score value for "${category}"`);
        
        this.scoreboard.score({category: category, value: value});
        return Result.success(`Scored ${value} in "${category}" successfully`)
  }
}
