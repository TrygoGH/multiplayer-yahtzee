import { Console } from "console";
import Result from "../../../utils/Result.js";
import { Game } from "../models/Game.js";
import { Player } from "../models/Player.js";
import { TurnManager } from "./TurnManager.js";

export class GameManager {

    constructor() {
        this.playerGames = new Map();
        this.turnManager = new TurnManager();
    }

    init() {
        this.turnManager.init()
    }

    start(){
        console.log(this.playerGames.keys());
        for(const player of this.playerGames.keys()){
            this.initPlayerGame(player);
                   console.log("GAMESSSS2");
        }
    }

    addPlayer(player) {
        player.onRoll = () => this.roll(player);
        player.onToggleHoldDie = (index) => this.toggleHoldDie(player, index);
        player.onScore = (category) => this.score(player, category);

        this.playerGames.set(player, null);
    }

    initPlayerGame(player) {
        const game = new Game();
        game.useRuleset(Game.defaultRuleset);
        game.init();
        console.log("GAME AFTER INIT", game);
        this.playerGames.set(player, game);
    }

    roll(player) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.roll();

        return scoreResult;

    }

    toggleHoldDie(player, index) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.score();

        return scoreResult;
    }

    score(player, category) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.score();

        return scoreResult;
    }

    isPlayerTurn(player) {
        const isPlayerTurn = this.turnManager.isPlayerTurn(player);
        const result = isPlayerTurn
            ? Result.success(isPlayerTurn)
            : Result.failure(isPlayerTurn);

        return result;
    }

    getGameOfPlayer(player) {
        const hasGame = this.playerGames.has(player);
        if (!hasGame) return Result.failure(`Player ${player} does not have a game`);

        const game = this.playerGames.get(player);
        console.log("ga", this.playerGames);
        return Result.success(game);
    }

    getGameDataOfPlayer(player){
        const gameResult = this.getGameOfPlayer(player)
        if(gameResult.isFailure()) return gameResult;
        console.log(gameResult);
        const game = gameResult.unwrap();
        const gameData = game.getGameData();

        return Result.success(gameData);
    }
}

//The game manager is a collection of games that associates a set of games with a set of players