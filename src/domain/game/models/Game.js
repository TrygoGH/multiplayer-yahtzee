//A game is a representation of a game for a single player.

import { DiceHandler } from "../handlers/DiceHandler.js"
import { TurnHandler } from "../handlers/turnHandler.js";
import { ScoreHandler } from "../handlers/scoreHandler.js";
import { ScoreboardHandler } from "../handlers/ScoreboardHandler.js";
import { GameRules } from "./GameRules.js";
import { Result } from "../../../utils/Result.js";
import { PlayerGameData } from "./PlayerGameData.js";

export class Game {
    constructor() {
        this.gameRules = null;
        this.diceHandler = new DiceHandler();
        this.turnHandler = new TurnHandler();
        this.scoreHandler = new ScoreHandler();
        this.scoreboardHandler = new ScoreboardHandler();
    }

    init() {
        if (!this.gameRules) return Result.failure("No game rules have been set");

        this.reset();
        return Result.success("Successfully init game");
    }

    reset() {
        this.diceHandler.init();
        this.turnHandler.init();
        this.scoreHandler.init();
        this.scoreboardHandler.init();
    }

    useRuleset(ruleset) {
        if (!ruleset instanceof GameRules) return Result.failure("Invalid gamerules");  

        this.gameRules = ruleset;
        this.diceHandler.useRuleset(ruleset);
        this.turnHandler.useRuleset(ruleset);
        this.scoreHandler.useRuleset(ruleset);
        this.scoreboardHandler.useRuleset(ruleset);

        return Result.success("Successfully set gamerules");
    }

    start() {
        this.reset();
    }

    roll() {
        this.turnHandler.roll();
        this.diceHandler.rollDice();
        return Result.success("rolled");
    }

    toggleHoldDie(index) {
        if (!this.turnHandler.hasRolled()) return Result.failure("not rolled");

        const toggleDieResult = this.diceHandler.toggleHoldDie(index);

        return toggleDieResult;
    }

    score(category) {
        if (!this.turnHandler.hasRolled()) return Result.failure("Hasn't rolled");
        const diceValues = this.diceHandler.getDiceValues();
        const scores = this.scoreHandler.calculateAllScores(diceValues);
        const score = scores[category];
        const scoreResult = this.scoreboardHandler.score({
            category: category,
            value: score,
        })
                console.log(scoreResult);
        return scoreResult;
    }

    nextTurn(){
        this.turnHandler.nextTurn();
        this.diceHandler.resetHeld();
    }

    hasGameEnded(){
        const allScored = this.scoreboardHandler.scoreboard.hasScoredAll();
        const noTurns = this.turnHandler.getTurnsLeft() < 1;
        return allScored && noTurns;
    }

      /**
   * Returns a Scoreboard object with actual scores overriding possible scores.
   * @returns {Scoreboard} A new Scoreboard instance with combined values.
   */
  getCombinedScores() {
    const diceValues = this.diceHandler.getDiceValues()
    const actualScores = this.scoreboardHandler.scoreboard.getScores();
    const possibleScores = this.scoreHandler.calculateAllScores(diceValues);

    const combinedScores = {};
    for (const category in possibleScores) {
      combinedScores[category] =
        actualScores[category] !== null
          ? actualScores[category]
          : possibleScores[category];
    }

    return combinedScores;
  }

    getGameData() {
        const diceValues = this.diceHandler.getDiceValues();

        const gameData = new PlayerGameData();
        gameData.dice = this.diceHandler.getDice();
        gameData.rollsLeft = this.turnHandler.getRollsLeft();
        gameData.scores = this.scoreHandler.calculateAllScores(diceValues);
        gameData.combinedScores = this.getCombinedScores();
        gameData.scoredScores = this.scoreboardHandler.scoreboard;
        return gameData;
    }
}
