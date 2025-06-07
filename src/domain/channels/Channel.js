export class Channel {
    constructor(channelName, channelId) {
        if (Channel.isPlainObject(channelName) || Channel.isPlainObject(channelId)) {
            throw new Error("Invalid params. channelName and channelId must not be objects");
        }

        this.channelName = channelName;
        this.channelId = channelId;
    }

    static isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    toJSON() {
        return {
            channelName: this.channelName,
            channelId: this.channelId
        };
    }

    static fromJSON(channelName, channelId) {
        // channelName and channelId are strings
        return new Channel(channelName, channelId);
    }
}
