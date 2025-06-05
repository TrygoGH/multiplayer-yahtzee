import { Player } from "../models/Player.js";
import { GameManager } from "./GameManager.js";
import { MatchData } from "../models/MatchData.js";
import { User } from "../../user/User.js";
import { LinkMap } from "../../../utils/Maps.js";
import { TurnManager } from "./TurnManager.js";
import { Result, tryCatch, tryCatchFlex } from "../../../utils/Result.js";
import { MatchGameData } from "../models/MatchGameData.js";

export class MatchManager {
    constructor() {
        this.playerIdsGamesLinkMap = new LinkMap();
        this.turnManager = new TurnManager();
        this.matchData = new MatchData();
    }

    init(matchID) {
        this.matchData.init({ id: matchID });
        this.playerIdsGamesLinkMap.forwardMap.forEach(gameManager => {
            gameManager.init()
        });


    }

    /** 
    * @param {User} user
    */
    addUserAsPlayer(user) {
        const gameManager = new GameManager();
        gameManager.setPlayerData({ nickname: user.username });
        gameManager.initGame();
        const player = gameManager.getPlayer();
        this.setPlayerControls(player);
        this.playerIdsGamesLinkMap.set(player.id, gameManager);
        this.matchData.linkUserIdToPlayer({
            userID: user.id,
            player: player
        });
        //console.log(this.matchData.playersToUserIDsMap);
    }

    setPlayerControls(player) {
        player.onRoll = (player) => this.roll(player);
        player.onToggleHoldDie = (player, index) => this.toggleHoldDie(player, index);
        player.onScore = (player, category) => this.score(player, category);

        this.turnManager.addPlayer(player);
    }


    start() {
        this.gameManager.start();
    }

    isPlayerTurn(player) {
        const isPlayerTurn = this.turnManager.isPlayerTurn(player);
        const result = isPlayerTurn
            ? Result.success(isPlayerTurn)
            : Result.failure(isPlayerTurn);

        return result;
    }

    roll(player) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameManagerOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const rollResult = game.roll();

        return rollResult;
    }

    toggleHoldDie(player, index) {
        const isPlayerTurnResult = this.isPlayerTurn(player);
        if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

        const gameResult = this.getGameManagerOfPlayer(player);
        if (gameResult.isFailure()) return gameResult;

        const game = gameResult.unwrap();
        const toggleHoldDieResult = game.toggleHoldDie(index);

        return toggleHoldDieResult;
    }

    score(player, category) {
        return tryCatchFlex(() => {
            const isPlayerTurnResult = this.isPlayerTurn(player);
            if (isPlayerTurnResult.isFailure()) return isPlayerTurnResult;

            const result = this.getGameManagerOfPlayer(player)
                .bind(gameManager => gameManager.score(category))

            console.log(result);
            if (result.isFailure()) return result;

            const { gameManager } = result;
            gameManager.nextTurn();
            this.turnManager.next();

            return Result.success(`successfully scored in category ${category}`);
        })
    }

    getGameManagerOfPlayer(player) {
        return tryCatch(() => {
            const playerID = player.id;
            const hasGameManager = this.playerIdsGamesLinkMap.hasA(playerID);
            if (!hasGameManager) throw new Error(`Player ${player} does not have a GameManager`);

            const gameManager = this.playerIdsGamesLinkMap.getForward(playerID);
            if (!gameManager) throw new Error(`Player ${player} has an empty GameManager`);

            return gameManager;
        })
    }

    getGameOfPlayer(player) {
        return tryCatch(() => {
            const game = this.getGameManagerOfPlayer(player)
                .bindSync(gameManager => gameManager.getGame)
                .unwrapOrThrow(("failed to get game of player"));

            return game;
        })
    }

    getUserOfPlayer(player) {
        return tryCatch(() => {
            const user = this.matchData.getUserIdByPlayer(player);
            if (!user) throw new Error("User not found");
            return user;
        })
    }


    getPlayerOfUser(user) {
        return tryCatch(() => {
            const player = this.matchData.getPlayerByUserID(user.id);
            if (!player) throw new Error("Player not found");
            return player;
        })
    }

    getMatchData() {
        return this.matchData;
    }

    getCurrentPlayer() {
        return this.turnManager.getCurrentPlayer();
    }

    hasMatchEnded() {
        for (const game of this.playerIdsGamesLinkMap.values()) {
            if (game === null) {
                return Result.failure("One or more players do not have an active game");
            }
            if (!game.hasEnded()) {
                return Result.success(false);
            }
        }

        return Result.success(true);
    }

    getGameDataOfPlayer(player) {
        const result = this.getGameManagerOfPlayer(player)
            .bindSync(gameManager => gameManager.getGameData())
            .bindSync(gameData => tryCatchFlex(() => { gameData.isTurn = this.isPlayerTurn(player); return gameData }));

        return result;
    }

    getMatchData() {
        return tryCatchFlex(() => {
            const matchGameData = new MatchGameData();
            const players = this.matchData.playersToUserIDsMap.forwardMap.keys();
            for (const player of players) {
                const gameData = this.getGameDataOfPlayer(player);
                matchGameData.players.set(player.id, gameData);
            }
        })
    }

}