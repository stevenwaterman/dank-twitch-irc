import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { IRCMessage } from "../irc/irc-message";
import { UserState } from "./userstate";
export declare function parseActionAndMessage(trailingParameter: string): {
    isAction: boolean;
    message: string;
};
interface CheerPrivmsgMessage extends PrivmsgMessage {
    readonly bits: number;
    readonly bitsRaw: string;
}
/**
 * Omits `emoteSets` and `emoteSetsRaw` from {@link UserState} (because they are not sent
 * for `PRIVMSG` messages)
 */
export declare type PrivmsgUserState = Omit<UserState, "emoteSets" | "emoteSetsRaw">;
export declare class PrivmsgMessage extends ChannelIRCMessage implements PrivmsgUserState {
    readonly messageText: string;
    readonly isAction: boolean;
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
    readonly channelID: string;
    readonly serverTimestamp: Date;
    readonly serverTimestampRaw: string;
    constructor(ircMessage: IRCMessage);
    /**
     * Extracts a plain object only containing the fields defined by the
     * {@link PrivmsgUserState} interface.
     */
    extractUserState(): PrivmsgUserState;
    isCheer(): this is CheerPrivmsgMessage;
}
export {};
//# sourceMappingURL=privmsg.d.ts.map