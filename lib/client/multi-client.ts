import * as debugLogger from 'debug-logger';
import { ok, Result } from 'neverthrow/dist';
import { TwitchAPI } from '../api/twitchapi';
import { PongMessage, UserstateMessage } from '../message/twitch-types';
import { RoomState } from '../message/twitch-types/roomstate';
import { UserState } from '../message/twitch-types/userstate';
import { RoomStateTracker } from '../roomstate-tracker';
import { UserStateTracker } from '../userstate-tracker';
import { findAndPushToEnd, removeInPlace } from '../utils';
import { validateChannelName } from '../validation';
import { BaseClient } from './base-client';
import { ClientConfiguration } from './config';
import { SingleConnection } from './connection';
import { AlternateMessageModifier } from './functionalities/alternate-message-modifier';
import {
    messageRateLimitPresets,
    MessageRateLimits} from './ratelimiters/message-rate-limiter';
import { PrivmsgMessageRateLimiter } from './ratelimiters/privmsg';
import { SlowModeRateLimiter } from './ratelimiters/slow-mode';
import { WhisperMessageRateLimiter } from './ratelimiters/whisper';
import { ClientError } from './errors';
import { JoinLock } from './join-lock';

const log = debugLogger('dank-twitch-irc:client');

/**
 * never forward these because they are for connection control of the individual connections only
 */
const neverForwardCommands: string[] = [
    'PING',
    'PONG',
    'RECONNECT',
    'CAP',
    '001',
    '002',
    '003',
    '004',
    '375',
    '372',
    '376'
];

export class Client extends BaseClient {
    private readonly connections: SingleConnection[] = [];
    private activeWhisperConn: SingleConnection | undefined;
    private readonly userStateTracker = new UserStateTracker();
    private readonly roomStateTracker = new RoomStateTracker();
    private readonly alternateMessageModifier: AlternateMessageModifier;

    private privmsgRateLimiter: PrivmsgMessageRateLimiter;
    private whisperRateLimiter: WhisperMessageRateLimiter;
    private slowModeRateLimiter: SlowModeRateLimiter;

    public constructor(configuration?: Partial<ClientConfiguration>) {
        super(configuration);

        this.privmsgRateLimiter = new PrivmsgMessageRateLimiter(this.configuration.username, this.userStateTracker);
        this.whisperRateLimiter = new WhisperMessageRateLimiter();
        this.slowModeRateLimiter = new SlowModeRateLimiter(this.configuration.username,
            this.userStateTracker, this.roomStateTracker);

        this.alternateMessageModifier = new AlternateMessageModifier(this.configuration);
        this.alternateMessageModifier.registerListenersOn(this);

        this.userStateTracker.registerListenersOn(this);
        this.roomStateTracker.registerListenersOn(this);

        this.onError.sub(error => {
            if (error instanceof ClientError) {
                this.connections.forEach(conn => conn.destroy(error));
            }
        });

        this.onClose.sub(hadError => {
            if (hadError) {
                this.connections.forEach(conn => conn.destroy());
            } else {
                this.connections.forEach(conn => conn.close());
            }
        });
    }

    private newConnection(): SingleConnection {
        log.debug('Creating new connection');

        let conn = new SingleConnection(this.configuration);

        conn.onConnecting.sub(() => this._onConnecting.dispatch());
        conn.onConnect.sub(() => this._onConnect.dispatch());
        conn.onReady.sub(() => this._onReady.dispatch());
        conn.onError.sub(e => this._onError.dispatch(e));
        conn.onClose.sub(async (hadError) => {
            if (hadError) {
                log.warn('Connection was closed due to error');
            } else {
                log.debug('Connection closed normally');
            }

            removeInPlace(this.connections, conn);
            if (this.activeWhisperConn === conn) {
                this.activeWhisperConn = undefined;
            }
            await this.reconnectFailedConnection(conn);
        });

        // forward events to this client
        conn.forwardEvents(this, cmd => {
            if (neverForwardCommands.includes(cmd)) {
                return false;
            }

            // only forward whispers from the currently active whisper connection
            if (cmd === 'WHISPER') {
                if (this.activeWhisperConn == null) {
                    this.activeWhisperConn = conn;
                    return true;
                }

                return this.activeWhisperConn === conn;
            }

            return true;
        });

        conn.connect();

        // connection will be used by the code that requested the connection therefore it's added to the back
        // of the queue
        this.connections.push(conn);
        return conn;
    }

    private async reconnectFailedConnection(conn: SingleConnection): Promise<void> {
        if (this.closed) {
            // Don't reconnect if we're closed
            return;
        }

        // rejoin channels, creates connections on demand
        let channels = Array.from(conn.channels);
        await this.joinAll(channels);

        // this ensures that clients with zero joined channels stay connected (so they can receive whispers)
        if (this.connections.length <= 0) {
            this.requireConnection();
        }
    }

    private requireConnection(filter: (conn: SingleConnection) => boolean = () => true): SingleConnection {
        // round-robin
        return findAndPushToEnd(this.connections, filter) || this.newConnection();
    }

    public get channels(): Set<string> {
        return new Set<string>([...this.connections.map(c => [...c.channels]).flat()]);
    }

    public async connect(): Promise<void> {
        let rateLimits: MessageRateLimits = messageRateLimitPresets.default;
        (async () => {

            if (this.configuration.clientID != null) {
                let api = new TwitchAPI(this.configuration.clientID);
                rateLimits = await api.getUserChatRateLimits(this.configuration.username);
            } else {
                rateLimits = messageRateLimitPresets.default;
            }

        })().catch(e => {
            log.warn('Error fetching rate limits for %s, falling back to defaults',
                this.configuration.username, e);
            rateLimits = messageRateLimitPresets.default;
        }).finally(() => {
            log.info('Applying rate limits:', rateLimits);
            this.privmsgRateLimiter.applyRateLimits(rateLimits);
            this.whisperRateLimiter.applyRateLimits(rateLimits);
        });
        this.requireConnection();
    }

    public close(): void {
        // -> connections are close()d
        this._onClose.dispatch(false);
    }

    public destroy(error?: Error): void {
        // we emit onError before onClose just like the standard node.js core modules do
        let hadError = error != null;
        if (hadError) {
            this._onError.dispatch(error!);
        }

        // -> connections are destroy()ed or close()d
        this._onClose.dispatch(hadError);
    }

    public send(command: string): void {
        this.requireConnection().send(command);
    }

    private joinLock: JoinLock = new JoinLock();

    public async join(channelName: string): Promise<RoomState> {
        validateChannelName(channelName);
        return this.joinLock.wrap(channelName, async () => {
            if (this.channels.has(channelName)) {
                return this.roomStateTracker.getState(channelName) as RoomState;
            }
            let conn = this.requireConnection(e => e.channels.size < this.configuration.maxChannelCountPerConnection);
            return await conn.join(channelName);
        });
    }

    public async joinAll(channelNames: string[]): Promise<Record<string, Result<RoomState, Error>>> {
        channelNames.forEach(validateChannelName);
        return this.joinLock.wrapAll(channelNames, async () => {
            let results: Record<string, Result<RoomState, Error>> = {};
            let needToJoin: string[] = [];

            for (let channelName of channelNames) {
                if (this.channels.has(channelName)) {
                    results[channelName] = ok(this.roomStateTracker.getState(channelName) as RoomState);
                } else {
                    needToJoin.push(channelName);
                }
            }

            let promises: Promise<void>[] = [];


            let idx = 0;
            while (idx < needToJoin.length) {
                let conn = this.requireConnection(
                    c => c.channels.size < this.configuration.maxChannelCountPerConnection);
                let canJoin = this.configuration.maxChannelCountPerConnection - conn.channels.size;
                let slice = needToJoin.slice(idx, idx += canJoin);

                promises.push((async () => {
                    let chunkResult = conn.joinAll(slice);
                    Object.assign(results, chunkResult);
                })());
            }

            await Promise.all(promises);

            return results;
        });
    }

    private ownMessagesBackFilter(channelName: string): (conn: SingleConnection) => boolean {
        if (!this.channels.has(channelName)) {
            // doesn't matter. Won't get our own message back anyways.
            return () => true;
        }

        if (this.configuration.receiveOwnMessagesBack) {
            // then we need to select a channel where we're not joined to the channel.
            return conn => !conn.channels.has(channelName);
        } else {
            return conn => conn.channels.has(channelName);
        }
    }

    public async privmsg(channelName: string, message: string): Promise<void> {
        return this.privmsgRateLimiter.rateLimitPrivmsg(channelName, async () => {
            return this.requireConnection().privmsg(channelName, message);
        });
    }

    public async say(channelName: string, message: string): Promise<UserstateMessage> {
        return this.slowModeRateLimiter.rateLimitMessage(channelName, async () => {
            return this.privmsgRateLimiter.rateLimitPrivmsg(channelName, async () => {
                let modifiedMessage = this.alternateMessageModifier.appendInvisibleCharacter(channelName, message);
                return this.requireConnection(this.ownMessagesBackFilter(channelName)).say(channelName, modifiedMessage);
            });
        });
    }

    public me(channelName: string, message: string): Promise<UserstateMessage> {
        return this.slowModeRateLimiter.rateLimitMessage(channelName, async () => {
            return this.privmsgRateLimiter.rateLimitPrivmsg(channelName, async () => {
                let modifiedMessage = this.alternateMessageModifier.appendInvisibleCharacter(channelName, message);
                return this.requireConnection(this.ownMessagesBackFilter(channelName)).me(channelName, modifiedMessage);
            });
        });
    }

    public whisper(username: string, message: string): Promise<void> {
        return this.whisperRateLimiter.rateLimitWhisper(username, async () => {
            return this.requireConnection().whisper(username, message);
        });
    }

    public ping(): Promise<PongMessage> {
        return this.requireConnection().ping();
    }

    public getRoomState(channelName: string): RoomState | undefined {
        return this.roomStateTracker.getState(channelName);
    }

    public getUserState(channelName: string): UserState | undefined {
        return this.userStateTracker.getState(channelName);
    }

}