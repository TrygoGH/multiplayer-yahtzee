import { Channel } from "./Channel.js";
import { ChannelCollection } from "./ChannelCollection.js";

export class ChannelManager {
    static CHANNEL_TYPES = {
        rooms: "rooms",
        broadcasts: "broadcasts"
    };

    constructor({ rooms = [], broadcasts = [] } = {}) {
        this.rooms = new ChannelCollection(rooms);
        this.broadcasts = new ChannelCollection(broadcasts);
    }


    static newChannel({ channelName, channelId }) {
        return new Channel(channelName, channelId);
    }

    setRoom({ channelName, channelId }) {
       return this.rooms.set(ChannelManager.newChannel({ channelName, channelId }));
    }

    getRoom(channelName) {
        return this.rooms.get(channelName);
    }

    deleteRoom(channelName) {
        return this.rooms.delete(channelName);
    }

    setBroadcast({ channelName, channelId }) {
        this.broadcasts.set(ChannelManager.newChannel({ channelName, channelId }));
    }

    getBroadcast(channelName) {
        return this.broadcasts.get(channelName);
    }

    deleteBroadcast(channelName) {
        return this.broadcasts.delete(channelName);
    }

    getAllRooms() {
        return this.rooms.getAll();
    }

    getAllBroadcasts() {
        return this.broadcasts.getAll();
    }

    getAll() {
        return {
            rooms: this.getAllRooms(),
            broadcasts: this.getAllBroadcasts()
        };
    }

    isValidChannel(obj) {
        return obj instanceof Channel || this.hasRequiredChannelTypes(obj);
    }

    hasRequiredChannelTypes(obj) {
        return Object.values(ChannelManager.CHANNEL_TYPES).every(
            key => Object.prototype.hasOwnProperty.call(obj, key)
        );
    }

    isValidChannelEntry(obj) {
        return obj instanceof Channel;
    }

    toJSON() {
        return {
            rooms: this.rooms.toJSON(),
            broadcasts: this.broadcasts.toJSON(),
        };
    }

    static fromJSON(obj = {}) {
        const rooms = obj.rooms ? ChannelCollection.fromJSON(obj.rooms) : new ChannelCollection();
        const broadcasts = obj.broadcasts ? ChannelCollection.fromJSON(obj.broadcasts) : new ChannelCollection();
        return new ChannelManager({ rooms, broadcasts });
    }
}



