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
        player.onRoll = (player) => {  console.log("rolling for", player);
            this.roll(player);
        }
        player.onToggleHoldDie = (player, index) => this.toggleHoldDie(player, index);
        player.onScore = (player, category) => this.score(player, category);

        this.playerGames.set(player, null);
        this.turnManager.addPlayer(player);
    }

    initPlayerGame(player) {
        const game = new Game();
        game.useRuleset(Game.defaultRuleset);
        game.init();
        console.log("GAME AFTER INIT", game);
        this.playerGames.set(player, game);
    }

    roll(player) {
        console.log("roll2");
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.roll();

        console.log(scoreResult);

        return scoreResult;

    }

    toggleHoldDie(player, index) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.toggleHoldDie(index);

        return scoreResult;
    }

    score(player, category) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const scoreResult = game.score(category);

        if(scoreResult.isFailure()) return scoreResult;
        
        game.nextTurn();
        this.turnManager.next();
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
        return Result.success(game);
    }

    getGameDataOfPlayer(player){
        const gameResult = this.getGameOfPlayer(player)
        if(gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const gameData = game.getGameData();

        return Result.success(gameData);
    }
}

//The game manager is a collection of games that associates a set of games with a set of players