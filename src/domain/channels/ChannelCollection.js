import { Channel } from "./Channel.js";

export class ChannelCollection {
    constructor(iterable = []) {
        this.channels = {};

        for (const channel of iterable) {
            this.set(channel); // this also validates
        }
    }

    set(channel) {
        if (!(channel instanceof Channel)) {
            throw new Error("Only Channel instances can be added");
        }
        this.channels[channel.channelName] = channel;
        return true;
    }

    get(channelName) {
        return this.channels[channelName];
    }

    delete(channelName) {
        const exists = Object.prototype.hasOwnProperty.call(this.channels, channelName);
        if (exists) delete this.channels[channelName];
        return exists;
    }

    has(channelName) {
        return Object.prototype.hasOwnProperty.call(this.channels, channelName);
    }

    getAll() {
        return { ...this.channels };
    }

    [Symbol.iterator]() {
        return Object.values(this.channels)[Symbol.iterator]();
    }

    toJSON() {
        // Return plain object mapping channelName => channel.toJSON()
        const obj = {};
        for (const [channelName, channel] of Object.entries(this.channels)) {
            obj[channelName] = channel.channelId;
        }
        return obj;
    }

    static fromJSON(obj = {}) {
        // obj: { [channelName]: channelId }
        const channels = [];
        for (const [channelName, channelId] of Object.entries(obj)) {
            channels.push(Channel.fromJSON(channelName, channelId));
        }
        return new ChannelCollection(channels);
    }
    
}
