import {CATEGORIES} from "../constants/Catagories.js";
import {Result} from "../../../utils/Result.js";

export class Scoreboard {
    constructor(initialScores = {}) {
      this.scores = {
        ones: null,
        twos: null,
        threes: null,
        fours: null,
        fives: null,
        sixes: null,
        three_of_a_kind: null,
        four_of_a_kind: null,
        full_house: null,
        small_straight: null,
        large_straight: null,
        yahtzee: null,
        chance: null,
        ...initialScores,
      };
    }

    getScores() {
        return { ...this.scores };
    }

    score(category, value){
        if (!Object.hasOwn(CATEGORIES, category)) return Result.failure(`Category "${category}" does not exist`);
        if (this.scores[category] !== null) return Result.failure(`Category "${category}" already has a score`);
        if (typeof value !== 'number') return Result.failure(`Invalid score value for "${category}"`);
        
        this.scores[category] = value;
        return Result.success(`Scored ${value} in "${category}" successfully`)
    }
}

