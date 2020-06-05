"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const tsd_1 = require("tsd");
const badge_1 = require("../badge");
const badges_1 = require("../badges");
const emote_1 = require("../emote");
const twitch_message_1 = require("../parser/twitch-message");
const usernotice_1 = require("./usernotice");
describe("./message/twitch-types/usernotice", function () {
    describe("#extractEventParams()", function () {
        it("should camelCase all properties that start with msg-param-", function () {
            chai_1.assert.deepStrictEqual(usernotice_1.extractEventParams({
                "msg-param-user-name": "pajlada",
                "msg-id": "abc123efg",
                "msg-parameter-msg-id": "987398274923",
            }), {
                username: "pajlada",
            });
        });
        it("should parse integer properties and add a raw- property for them", function () {
            chai_1.assert.deepStrictEqual(usernotice_1.extractEventParams({
                "msg-param-months": "12",
            }), {
                months: 12,
                monthsRaw: "12",
            });
        });
        it("should parse boolean properties and add a raw- property for them", function () {
            chai_1.assert.deepStrictEqual(usernotice_1.extractEventParams({
                "msg-param-should-share-streak": "1",
            }), {
                shouldShareStreak: true,
                shouldShareStreakRaw: "1",
            });
            chai_1.assert.deepStrictEqual(usernotice_1.extractEventParams({
                "msg-param-should-share-streak": "0",
            }), {
                shouldShareStreak: false,
                shouldShareStreakRaw: "0",
            });
        });
        it("should camelCase -id as ID", function () {
            chai_1.assert.deepStrictEqual(usernotice_1.extractEventParams({
                "msg-param-user-id": "1234567",
            }), {
                userID: "1234567",
            });
        });
    });
    describe("UsernoticeMessage", function () {
        it("should be able to parse a USERNOTICE with no message, only system-msg", function () {
            const msgText = "@badge-info=subscriber/5;badges=subscriber/3;color=;display-name=kakarot127;" +
                "emotes=;flags=;id=5dc14bb3-684b-4c04-8fbb-3c870958ac69;login=kakarot127;mod=0;msg-id=resub;" +
                "msg-param-cumulative-months=5;msg-param-months=0;msg-param-should-share-streak=0;" +
                "msg-param-sub-plan-name=Channel\\sSubscription\\s(faker);msg-param-sub-plan=1000;" +
                "room-id=43691;subscriber=1;system-msg=kakarot127\\ssubscribed\\sat\\sTier\\s1.\\sThey'" +
                "ve\\ssubscribed\\sfor\\s5\\smonths!;tmi-sent-ts=1563102742440;user-id=147030570;user-type= " +
                ":tmi.twitch.tv USERNOTICE #faker";
            const msg = twitch_message_1.parseTwitchMessage(msgText);
            chai_1.assert.instanceOf(msg, usernotice_1.UsernoticeMessage);
            chai_1.assert.strictEqual(msg.channelName, "faker");
            chai_1.assert.strictEqual(msg.channelID, "43691");
            chai_1.assert.isUndefined(msg.messageText);
            chai_1.assert.strictEqual(msg.systemMessage, "kakarot127 subscribed at Tier 1. They've subscribed " + "for 5 months!");
            chai_1.assert.strictEqual(msg.messageTypeID, "resub");
            chai_1.assert.strictEqual(msg.senderUsername, "kakarot127");
            chai_1.assert.strictEqual(msg.senderUserID, "147030570");
            chai_1.assert.deepStrictEqual(msg.badgeInfo, new badges_1.TwitchBadgesList(new badge_1.TwitchBadge("subscriber", "5")));
            chai_1.assert.strictEqual(msg.badgeInfoRaw, "subscriber/5");
            chai_1.assert.isUndefined(msg.bits);
            chai_1.assert.isUndefined(msg.bitsRaw);
            chai_1.assert.isUndefined(msg.color);
            chai_1.assert.strictEqual(msg.colorRaw, "");
            chai_1.assert.strictEqual(msg.displayName, "kakarot127");
            chai_1.assert.deepStrictEqual(msg.emotes, []);
            chai_1.assert.deepStrictEqual(msg.emotesRaw, "");
            chai_1.assert.strictEqual(msg.isMod, false);
            chai_1.assert.strictEqual(msg.isModRaw, "0");
            chai_1.assert.strictEqual(msg.serverTimestamp.getTime(), 1563102742440);
            chai_1.assert.strictEqual(msg.serverTimestampRaw, "1563102742440");
            chai_1.assert.deepStrictEqual(msg.eventParams, {
                cumulativeMonths: 5,
                cumulativeMonthsRaw: "5",
                months: 0,
                monthsRaw: "0",
                shouldShareStreak: false,
                shouldShareStreakRaw: "0",
                subPlanName: "Channel Subscription (faker)",
                subPlan: "1000",
            });
            chai_1.assert.isTrue(msg.isResub());
            chai_1.assert.isFalse(msg.isCheer());
            // typescript test:
            if (msg.isResub()) {
                tsd_1.expectType(msg);
                tsd_1.expectType(msg.eventParams);
                tsd_1.expectType(msg.eventParams.cumulativeMonths);
                tsd_1.expectType(msg.eventParams.cumulativeMonthsRaw);
            }
        });
        it("should be able to parse a resub with message", function () {
            const msg = twitch_message_1.parseTwitchMessage("@badge-info=subscriber/15;badges=subscriber/12;color=#00CCBE" +
                ";display-name=5weatyNuts;emotes=1076725:0-10;flags=;id=fda4d92" +
                "4-cde3-421d-8eea-713401194446;login=5weatynuts;mod=0;msg-id=resu" +
                "b;msg-param-cumulative-months=15;msg-param-months=0;msg-param-sh" +
                "ould-share-streak=0;msg-param-sub-plan-name=Channel\\sSubscripti" +
                "on\\s(dafrancsgo);msg-param-sub-plan=Prime;room-id=41314239;subs" +
                "criber=1;system-msg=5weatyNuts\\ssubscribed\\swith\\sTwitch\\sPri" +
                "me.\\sThey've\\ssubscribed\\sfor\\s15\\smonths!;tmi-sent-ts=1565" +
                "699032594;user-id=169613447;user-type= :tmi.twitch.tv USERNOTICE " +
                "#dafran :dafranPrime Clap");
            chai_1.assert.strictEqual(msg.messageText, "dafranPrime Clap");
            chai_1.assert.deepStrictEqual(msg.emotes, [
                new emote_1.TwitchEmote("1076725", 0, 11, "dafranPrime"),
            ]);
            chai_1.assert.strictEqual(msg.emotesRaw, "1076725:0-10");
            chai_1.assert(msg.isResub());
        });
    });
});
//# sourceMappingURL=usernotice.spec.js.map