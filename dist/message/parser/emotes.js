"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmotes = void 0;
const emote_1 = require("../emote");
const common_1 = require("./common");
const parse_error_1 = require("./parse-error");
function parseEmotes(messageText, emotesSrc) {
    const emotes = [];
    if (emotesSrc.length <= 0) {
        return emotes;
    }
    for (const emoteInstancesSrc of emotesSrc.split("/")) {
        const [emoteID, instancesSrc] = emoteInstancesSrc.split(":", 2);
        for (const instanceSrc of instancesSrc.split(",")) {
            const [startIndex, endIndexInclusive] = instanceSrc
                .split("-")
                .map(common_1.parseIntThrowing);
            if (endIndexInclusive == null) {
                throw new parse_error_1.ParseError(`No - found in emote index range "${instanceSrc}"`);
            }
            // to make endIndex exclusive
            const endIndex = endIndexInclusive + 1;
            if (endIndex > messageText.length) {
                throw new parse_error_1.ParseError(`End index ${endIndexInclusive} is out of range for given message string`);
            }
            const emoteText = messageText.slice(startIndex, endIndex);
            emotes.push(new emote_1.TwitchEmote(emoteID, startIndex, endIndex, emoteText));
        }
    }
    // sort by start index
    emotes.sort((a, b) => a.startIndex - b.startIndex);
    return emotes;
}
exports.parseEmotes = parseEmotes;
//# sourceMappingURL=emotes.js.map