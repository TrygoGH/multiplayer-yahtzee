import { Result } from "../../../utils/Result.js";
import { Game } from "../models/Game.js";
import { Player } from "../models/Player.js";
import { GameRules } from "../models/GameRules.js";
import { v4 } from "uuid";

export class GameManager {
    static defaultRuleset = new GameRules();

    constructor() {
        this.game = new Game();
        this.player = new Player();
    }

    init() {
        this.game.init();
    }

    setPlayerData({
        nickname
    }){
        this.player.name = nickname;
        this.player.id = v4();
    }

    start() {
        this.initGame();
    }

    getPlayer() {
        return this.player;
    }

    initGame() {
        this.game.useRuleset(GameManager.defaultRuleset);
        this.game.init();
    }

    roll() {
        const result = this.game.roll();
        return result;
    }

    toggleHoldDie(index) {
        const result = this.game.toggleHoldDie(index);
        return result;
    }

    score(category) {
        const result = this.game.score(category);
        
        if (result.isFailure()) return result;
        this.game.nextTurn();
        return result;
    }

    getGame() {
        const hasGame = (!this.game);
        if (!this.game) return Result.failure(`Player ${this.player} does not have a game`);

        return Result.success(this.game);
    }

    nextTurn(){
        this.game.nextTurn();
    }

    hasGameEnded() {

        if (this.game === null) return Result.failure("One or more players do not have an active game");
        if (!this.game.hasEnded()) return Result.success(false);

        return Result.success(true);
    }

    getGameData() {
        const gameData = this.game.getGameData();
        return Result.success(gameData);
    }
}

//The game manager is a collection of games that associates a set of games with a set of players