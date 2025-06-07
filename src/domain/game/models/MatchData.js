import { LinkMap } from "../../../utils/Maps.js";
import { Player } from "./Player.js";

export class MatchData{
    constructor(){
        this.id = null;
        this.playersToUserIDsMap = new LinkMap();
    }

    init({
        id
    } = {}){
        this.id = id;
        this.playersToUserIDsMap = new LinkMap();
    }

    linkUserIdToPlayer({userID, player}){
        this.playersToUserIDsMap.set(player, userID);
    }

    getUserIdByPlayer(player){
        return this.playersToUserIDsMap.getForward(player);
    }

    getPlayerByUserID(userID){
        return this.playersToUserIDsMap.getReverse(userID);
    }

    getPlayers(){
        return this.playersToUserIDsMap.forwardMap.keys();
    }

    getUserIDs(){
        return this.playersToUserIDsMap.forwardMap.values();
    }
}