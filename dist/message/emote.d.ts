/**
 * Single instance of a twitch emote in a message string.
 */
export declare class TwitchEmote {
    /**
     * Numeric ID identifying the emote.
     */
    id: string;
    /**
     * inclusive start index in the original message text
     */
    startIndex: number;
    /**
     * exclusive end index in the original message text
     */
    endIndex: number;
    /**
     * The part of the original message string that was recognizes as an emote, e.g. "Kappa".
     */
    code: string;
    constructor(id: string, startIndex: number, endIndex: number, text: string);
}
//# sourceMappingURL=emote.d.ts.map