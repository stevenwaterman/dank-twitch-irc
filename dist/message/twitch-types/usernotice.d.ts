import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { IRCMessageData } from "../irc/irc-message";
import { IRCMessageTags } from "../irc/tags";
export declare function getCamelCasedName(tagKey: string): string;
export interface EventParams {
    [key: string]: string | number | boolean;
}
export declare function extractEventParams(tags: IRCMessageTags): EventParams;
export interface SharesStreakSubParams extends EventParams {
    shouldShareStreak: true;
    streakMonths: number;
    streakMonthsRaw: string;
}
export interface HiddenStreakSubParams extends EventParams {
    shouldShareStreak: false;
    streakMonths: 0;
    streakMonthsRaw: "0";
}
export declare type StreakSubParams = SharesStreakSubParams | HiddenStreakSubParams;
export declare type SubEventParams = EventParams & StreakSubParams & {
    cumulativeMonths: number;
    cumulativeMonthsRaw: string;
    subPlan: string;
    subPlanName: string;
};
export interface RaidParams extends EventParams {
    displayName: string;
    login: string;
    viewerCount: number;
    viewerCountRaw: string;
}
export interface SubgiftParameters extends EventParams {
    months: number;
    monthsRaw: string;
    recipientDisplayName: string;
    recipientID: number;
    recipientUsername: string;
    subPlan: string;
    subPlanName: string;
}
export declare type AnonSubgiftParameters = SubgiftParameters;
export declare type AnonGiftPaidUpgradeParameters = EventParams & {
    promoGiftTotal?: number;
    promoGiftTotalRaw?: string;
    promoName?: string;
};
export declare type GiftPaidUpgradeParameters = AnonGiftPaidUpgradeParameters & {
    senderLogin: string;
    senderName: string;
};
export interface RitualParameters extends EventParams {
    ritualName: string;
}
export interface BitsBadgeTierParameters extends EventParams {
    threshold: number;
    thresholdRaw: string;
}
export interface SpecificUsernoticeMessage<I extends string, E extends EventParams> {
    readonly messageTypeID: I;
    readonly eventParams: E;
}
export declare type SubUsernoticeMessage = SpecificUsernoticeMessage<"sub", SubEventParams>;
export declare type ResubUsernoticeMessage = SpecificUsernoticeMessage<"resub", SubEventParams>;
export declare type RaidUsernoticeMessage = SpecificUsernoticeMessage<"raid", RaidParams>;
export declare type SubgiftUsernoticeMessage = SpecificUsernoticeMessage<"subgift", SubgiftParameters>;
export declare type AnonSubgiftUsernoticeMessage = SpecificUsernoticeMessage<"anonsubgift", AnonSubgiftParameters>;
export declare type AnonGiftPaidUpgradeUsernoticeMessage = SpecificUsernoticeMessage<"anongiftpaidupgrade", AnonGiftPaidUpgradeParameters>;
export declare type GiftPaidUpgradeUsernoticeMessage = SpecificUsernoticeMessage<"giftpaidupgrade", GiftPaidUpgradeParameters>;
export declare type RitualUsernoticeMessage = SpecificUsernoticeMessage<"ritual", RitualParameters>;
export declare type BitsBadgeTierUsernoticeMessage = SpecificUsernoticeMessage<"bitsbadgetier", BitsBadgeTierParameters>;
interface CheerUsernoticeMessage extends UsernoticeMessage {
    readonly bits: number;
    readonly bitsRaw: string;
}
export declare class UsernoticeMessage extends ChannelIRCMessage {
    readonly channelID: string;
    readonly messageText: string | undefined;
    readonly systemMessage: string;
    /** sub, resub, subgift, etc... */
    readonly messageTypeID: string;
    readonly senderUsername: string;
    readonly senderUserID: string;
    readonly badgeInfo: TwitchBadgesList;
    readonly badgeInfoRaw: string;
    readonly badges: TwitchBadgesList;
    readonly badgesRaw: string;
    readonly bits: number | undefined;
    readonly bitsRaw: string | undefined;
    readonly color: Color | undefined;
    readonly colorRaw: string;
    readonly displayName: string;
    readonly emotes: TwitchEmoteList;
    readonly emotesRaw: string;
    readonly messageID: string;
    readonly isMod: boolean;
    readonly isModRaw: string;
    readonly serverTimestamp: Date;
    readonly serverTimestampRaw: string;
    readonly eventParams: EventParams;
    constructor(message: IRCMessageData);
    isCheer(): this is CheerUsernoticeMessage;
    isSub(): this is SubUsernoticeMessage;
    isResub(): this is ResubUsernoticeMessage;
    isRaid(): this is RaidUsernoticeMessage;
    isSubgift(): this is SubgiftUsernoticeMessage;
    isAnonSubgift(): this is AnonSubgiftUsernoticeMessage;
    isAnonGiftPaidUpgrade(): this is AnonGiftPaidUpgradeUsernoticeMessage;
    isGiftPaidUpgrade(): this is GiftPaidUpgradeUsernoticeMessage;
    isRitual(): this is RitualUsernoticeMessage;
    isBitsBadgeTier(): this is BitsBadgeTierUsernoticeMessage;
}
export {};
//# sourceMappingURL=usernotice.d.ts.map