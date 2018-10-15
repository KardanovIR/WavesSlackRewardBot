/**
 * @const {object} CONF
 */
const CONF = require('../conf.json');

/**
 * @const {@slack/client.RTMClient} RTMClient
 *
 * @see https://slackapi.github.io/node-slack-sdk/rtm_api
 */
/**
 * @const {@slack/client.WebClient} WebClient
 *
 * @see https://slackapi.github.io/node-slack-sdk/web_api
 */
const {RTMClient, WebClient} = require('@slack/client');

/**
 * @class WavesSlackRewardBot.Slack
 *
 * @see https://github.com/slackapi/node-slack-sdk
 */
class Self {

    /**
     * @static
     * @const {string} CMD_HELP
     */
    static get CMD_HELP() {
        return 'help';
    }

    /**
     * @static
     * @const {string} CMD_PING
     */
    static get CMD_PING() {
        return 'ping';
    }

    /**
     * @static
     * @const {string} CMD_WHOAMI
     */
    static get CMD_WHOAMI() {
        return 'whoami';
    }

    /**
     * @static
     * @const {string} CMD_WHOIS
     */
    static get CMD_WHOIS() {
        return 'whois';
    }

    /**
     * @static
     * @const {string} CMD_GET_SEED
     */
    static get CMD_GET_SEED() {
        return 'seed';
    }

    /**
     * @static
     * @const {string} CMD_GET_STAT
     */
    static get CMD_GET_STAT() {
        return 'stat';
    }

    /**
     * @static
     * @const {string} CMD_GET_ADDRESS
     */
    static get CMD_GET_ADDRESS() {
        return 'address';
    }

    /**
     * @static
     * @const {string} CMD_GET_BALANCE
     */
    static get CMD_GET_BALANCE() {
        return 'balance';
    }

    /**
     * @static
     * @const {string} CMD_UPDATE
     */
    static get CMD_UPDATE() {
        return 'update';
    }

    /**
     * @static
     * @const {Array} CMD_LIST
     */
    static get CMD_LIST() {
        return [
            Self.CMD_HELP,
            Self.CMD_PING,
            Self.CMD_WHOIS,
            Self.CMD_WHOAMI,
            Self.CMD_GET_SEED,
            Self.CMD_GET_STAT,
            Self.CMD_GET_ADDRESS,
            Self.CMD_GET_BALANCE,
            Self.CMD_UPDATE
        ];
    }

    /**
     * @const {string} REGEXP_USER
     */
    get REGEXP_USER() {
        return '<@([^>]+)>';
    }

    /**
     * @const {string} REGEXP_INSTANT_MESSAGE
     */
    get REGEXP_INSTANT_MESSAGE() {
        return '(\\d+)[\\s\\S]+(' +
               this._lang.CURRENCY_ALIASES.join('|') +
               ')[\\s\\S]+<@([^>]+)>[\\s\\S]*';
    }

    /**
     * @private
     * @member {string} _me
     */
    get _me() {
        return this._rtm.activeUserId;
    }

    /**
     * @constructor
     *
     * @param {object} args
     *
     * @fires this._event.EVENT_SLACK_NOT_CONNECTED
     * @fires this._event.EVENT_SLACK_CONNECTED
     */
    constructor(args) {
        // Set error handler
        this._error = args.error;

        // Set link to global language vocabularies
        this._lang = args.lang;

        // Set link to global event emitter
        this._event = args.event;

        // Bind some methods to the current context
        this._route = this._route.bind(this);
        this._routeMessages = this._routeMessages.bind(this);

        // For interactive operations
        this._rtm = new RTMClient(CONF.SLACK_API.TOKEN);
        this._rtm.start();

        // For simple operations
        this._web = new WebClient(CONF.SLACK_API.TOKEN);

        // Add event handlers
        this._live();

        // No need to go further
        if (!this._rtm || !this._web) {
            this._event.pub(this._event.EVENT_SLACK_NOT_CONNECTED);
            return;
        }

        // Everything's ok
        this._event.pub(this._event.EVENT_SLACK_CONNECTED);
    }

    /**
     * @private
     * @method _isMe
     *
     * @param {string} uid
     *
     * @returns {boolean}
     */
    _isMe(uid) {
        return this._isSame(uid, this._me);
    }

    /**
     * @private
     * @method _isSame
     *
     * @param {string} eid
     * @param {string} rid
     *
     * @returns {boolean}
     */
    _isSame(eid, rid) {
        return eid === rid;
    }

    /**
     * @private
     * @method _isAdmin
     *
     * @param {string} uid
     *
     * @returns {boolean}
     */
    _isAdmin(uid) {
        return CONF.SLACK_API.ADMINS_LIST.indexOf(uid) > -1;
    }

    /**
     * @private
     * @method _isIM
     *
     * @param {string} id
     *
     * @returns {boolean}
     */
    async _isIM(id) {
        var
            info = await this._getConversationInfo(id).
                   catch(this._error);

        if (info && info.ok) {
            return info.channel.is_im;
        }

        return false;
    }

    /**
     * @private
     * @method _getTaggedUser
     *
     * @param {string} uid
     */
    static _getTaggedUser(uid) {
        return `<@${uid}>`;
    }

    /**
     * @private
     * @method _live
     */
    _live() {
        // Slack events
        this._rtm.on('message', this._routeMessages);
        this._rtm.on('reaction_added', this._routeMessages);

        // Modules events
        this._event.sub(this._event.EVENT_NODE_REQUEST_ABORTED, this._route);
        this._event.sub(this._event.EVENT_NODE_REQUEST_REJECTED, this._route);
        this._event.sub(this._event.EVENT_NODE_REQUEST_SUCCEEDED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_CREATED_NEW_WALLETS, this._route);
        this._event.sub(this._event.EVENT_STORAGE_TRANSFER_COMPLETED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_SEED_REQUEST_FAILED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_STAT_REQUEST_FAILED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_ADDRESS_REQUEST_FAILED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED, this._route);
    }

    /**
     * @async
     * @private
     * @method _route
     *
     * @param {Event} event
     */
    _route(event) {
        switch (event.type) {

            // Answer with default Node request abort
            case this._event.EVENT_NODE_REQUEST_ABORTED:
                this._answerDefaultNodeRequestAbort(event.data);
                break;

            // Answer with default Node request reject
            case this._event.EVENT_NODE_REQUEST_REJECTED:
                this._answerDefaultNodeRequestReject(event.data);
                break;

            // Answer with default Node request success
            case this._event.EVENT_NODE_REQUEST_SUCCEEDED:
                if (event.data.balance) {
                    this._answerMyBalance(event.data);
                } else if (event.data.stat) {
                    this._answerStat(event.data);
                }
                break;

            // Answer that transfer was completed
            case this._event.EVENT_STORAGE_TRANSFER_COMPLETED:
                this._answerTransferCompleted(event.data)
                break;

            // Answer that my wallet seed request failed
            case this._event.EVENT_STORAGE_SEED_REQUEST_FAILED:
                this._answer(event.data.channel.id, this._lang.ANSWER_YOUR_SEED_IS_UNKNOWN);
                break;

            // Answer that my wallet seed request succeeded
            case this._event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED:
                this._answerMySeed(event.data);
                break;

            // Answer that my wallet address request failed
            case this._event.EVENT_STORAGE_ADDRESS_REQUEST_FAILED:
                this._answer(event.data.channel.id, this._lang.ANSWER_ADDRESS_REQUEST_FAILED);
                break;

            // Answer that my wallet address request succeeded
            case this._event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED:
                this._answerMyAddress(event.data);
                break;

            // Answer that stat request failed
            case this._event.EVENT_STORAGE_STAT_REQUEST_FAILED:
                this._answer(event.data.channel.id, this._lang.ANSWER_STAT_REQUEST_FAILED);
                break;

            // 
            case this._event.EVENT_STORAGE_CREATED_NEW_WALLETS:
                this._answerNewWalletsCreated(event.data);
                break;

        }
    }

    /**
     * @async
     * @private
     * @method _routeMessages
     *
     * @param {Event} event
     */
    async _routeMessages(event) {
        // Skip messages that are from a bot or my own user ID
        if (
            (!event.text && !event.reaction) ||
            (event.subtype) ||
            this._isMe(event.user)
        ) {
            return;
        }

        var
            cmd = -1,
            text = '';

        // Apply message parsers
        switch (event.type) {

            // Regular message
            case 'message':
                if (await this._isIM(event.channel).catch(this._error)) {
                    text = event.text.toString().split(' ').shift().toLowerCase();
                    cmd = Self.CMD_LIST.indexOf(text);

                    if (cmd > -1) {
                        // Command
                        this._parseCommandMessage(cmd, event);
                    } else {
                        // Instant
                        this._parseInstantMessage(event);
                    }
                } else if (event.text.indexOf(this._me) === 2) {
                    // Channel
                    this._parseChannelMessage(event);
                }
                break;

            // Reaction message
            case 'reaction_added':
                this._parseReactionMessage(event);
                break;

        }
    }

    /**
     * @async
     * @private
     * @method _answer
     *
     * @param {string} channel
     * @param {string} text
     * @param {string} uid
     * @param {boolean} forceIM
     */
    async _answer(channel, text, uid, forceIM = false) {
        var
            im = await this._isIM(channel).catch(this._error);

        // 
        if (!im || forceIM) {
            channel = `@${uid}`;
        }

        await this._web.chat.postMessage({channel, text}).
        catch(this._error);
    }

    /**
     * @private
     * @method _answerNewWalletsCreated
     *
     * @param {object} data
     */
    _answerNewWalletsCreated(data) {
        var
            created = data.update.users.length,
            text = this._lang.ANSWER_NEW_WALLETS_CREATED.
                   replace('${count}', created).
                   replace('${pluralized}', this._lang.pluralize(
                       created,
                       this._lang.WALLET_ONE,
                       this._lang.WALLET_TWO,
                       this._lang.WALLET_ALL
                   ));

        this._answer(
            data.channel.id,
            text,
            data.emitent.id
        );
    }

    /**
     * @async
     * @private
     * @method _answerDefaultNodeRequestAbort
     *
     * @param {object} data
     */
    async _answerDefaultNodeRequestAbort(data) {
        this._answer(
            data.channel.id,
            this._lang.ANSWER_NODE_REQUEST_ABORTED,
            data.emitent.id
        );
    }

    /**
     * @async
     * @private
     * @method _answerDefaultNodeRequestReject
     *
     * @param {object} data
     */
    async _answerDefaultNodeRequestReject(data) {
        this._answer(
            data.channel.id,
            (
                this._lang.ANSWER_NODE_REQUEST_REJECTED +
                (data.answer ? ' ' + data.answer : '')
            ),
            data.emitent.id
        );
    }

    /**
     * @async
     * @private
     * @method _answerTransferCompleted
     *
     * @param {object} data
     */
    async _answerTransferCompleted(data) {
        var
            link = CONF.WAVES_API.TRANSFER_LINK.
                   replace('${transactionId}', data.transfer.id),
            text = this._lang.ANSWER_TRANSFER_COMPLETED.
                   replace('${link}', link).
                   replace('${hash}', data.transfer.id);

        // Tell emitent that transfer succeeded
        this._answer(data.channel.id, text, data.emitent.id);

        // Tell recipient that transfer happened
        setTimeout(() => {
            text = this._lang.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT.
                   replace('${user}', Self._getTaggedUser(data.emitent.id)).
                   replace('${link}', link).
                   replace('${amount}', data.transfer.amount).
                   replace('${pluralized}', this._lang.pluralize(
                       data.transfer.amount,
                       this._lang.CURRENCY_ONE,
                       this._lang.CURRENCY_TWO,
                       this._lang.CURRENCY_ALL
                   ));

            this._answer(data.channel.id, text, data.recipient.id, true);
        }, CONF.SLACK_API.MESSAGE_TIMEOUT);
    }

    /**
     * @async
     * @private
     * @method _answerMySeed
     *
     * @param {object} data
     */
    async _answerMySeed(data) {
        var
            text = this._lang.ANSWER_YOUR_SEED_IS.
                   replace('${seed}', data.emitent.seed);

        this._answer(data.channel.id, text);
    }

    /**
     * @async
     * @private
     * @method _answerMyAddress
     *
     * @param {object} data
     */
    async _answerMyAddress(data) {
        var
            text = this._lang.ANSWER_YOUR_ADDRESS_IS.
                   replace('${address}', data.emitent.address);

        this._answer(data.channel.id, text);
    }

    /**
     * @async
     * @private
     * @method _answerMyBalance
     *
     * @param {object} data
     */
    async _answerMyBalance(data) {
        // No need to go further
        if (!data || !data.balance || !data.balance.count) {
            this._answer(data.channel.id, this._lang.ANSWER_BALANCE_ISNT_COUNTED);
            return;
        }

        var
            text = '';

        // Choose text for message
        if (data.recipient && data.recipient.id) {
            text = this._lang.ANSWER_USER_BALANCE_IS.
                   replace('${user}', Self._getTaggedUser(data.recipient.id));
        } else {
            text = this._lang.ANSWER_YOUR_BALANCE_IS;
        }

        // Fill other placeholders
        text = text.
               replace('${count}', data.balance.count).
               replace('${pluralized}', this._lang.pluralize(
                   data.balance.count,
                   this._lang.CURRENCY_ONE,
                   this._lang.CURRENCY_TWO,
                   this._lang.CURRENCY_ALL
               ));

        // Send
        this._answer(data.channel.id, text, data.emitent.id);
    }

    /**
     * @async
     * @private
     * @method _answerStat
     *
     * @param {object} data
     */
    async _answerStat(data) {
        var
            it0 = -1,
            last = data.stat.list.length - 1,
            symbols = CONF.SLACK_API.SYMBOLS_LIMIT,
            alias = (
                        data.stat.alias ?
                        this._lang['ANSWER_STAT_REQUEST_HEAD_FOR_' + data.stat.alias.toUpperCase()] :
                        this._lang.ANSWER_STAT_REQUEST_HEAD_FOR_MONTH
                    ).toUpperCase(),
            buffer = '',
            list = data.stat.list,
            item = null;

        // Compile answer message
        while (++it0 < list.length) {
            item = list[it0];

            buffer += this._lang.ANSWER_STAT_REQUEST_ITEM.
                      replace('${user}', Self._getTaggedUser(item[0])).
                      replace('${thaves}', item[1]);

            // Slack message limit
            if (buffer.length >= symbols) {
                buffer += this._lang.ANSWER_STAT_REQUEST_BREAK;
                break;
            }
        }

        alias = 'ANSWER_STAT_REQUEST_HEAD_FOR_' + alias;
        buffer = this._lang.ANSWER_STAT_REQUEST_SUCCEEDED.
                 replace('${head}', this._lang[alias]).
                 replace('${body}', buffer);

        // Send
        this._answer(data.channel.id, buffer);
    }

    /**
     * @async
     * @private
     * @method _answerWhoIs
     *
     * @param {Event} event
     */
    async _answerWhoIs(event) {
        var
            who = event.text.split(/\s+/)[1];

        // No need to go further
        if (!this._isAdmin(event.user)) {
            this._answer(data.channel.id, this._lang.ANSWER_ADMIN_ACCESS_REQUIRED);
            return;
        }

        // Answer
        this._answer(event.channel, Self._getTaggedUser(who), event.user)
    }

    /**
     * @async
     * @private
     * @method _getConversationInfo
     *
     * @param {string} id
     */
    async _getConversationInfo(id) {
        return await this._web.conversations.info({channel : id}).
               catch(this._error);
    }

    /**
     * @private
     * @method _parseCommandMessage
     *
     * @param {number} off
     * @param {Event} event
     */
    _parseCommandMessage(offset, event) {
        switch (Self.CMD_LIST[offset]) {

            // Check if bot's alive
            case Self.CMD_PING:
                this._answer(event.channel, this._lang.ANSWER_PONG, event.user);
                break;

            // Get help
            case Self.CMD_HELP:
                this._answer(event.channel, this._lang.ANSWER_HELP, event.user);
                break;

            // Get my slack id
            case Self.CMD_WHOAMI:
                this._answer(event.channel, event.user, event.user);
                break;

            // Get user slack info
            case Self.CMD_WHOIS:
                this._answerWhoIs(event);
                break;

            // Get my wallet seed
            case Self.CMD_GET_SEED:
                this._event.pub(this._event.EVENT_SLACK_SEED_REQUESTED, {
                    channel : {id : event.channel},
                    emitent : {id : event.user}
                });
                break;

            // Get statistics
            case Self.CMD_GET_STAT:
                this._event.pub(this._event.EVENT_SLACK_STAT_REQUESTED, {
                    channel : {id : event.channel},
                    emitent : {id : event.user},
                    stat : {alias : event.text.split(/\s+/)[1]}
                });
                break;

            // Get my wallet address
            case Self.CMD_GET_ADDRESS:
                this._event.pub(this._event.EVENT_SLACK_ADDRESS_REQUESTED, {
                    channel : {id : event.channel},
                    emitent : {id : event.user}
                });
                break;

            // Get my wallet balance
            case Self.CMD_GET_BALANCE:
                this._parseCommandGetBalance(event);
                break;

            case Self.CMD_UPDATE:
                this._parseCommandUpdate(event);
                break;

        }
    }

    /**
     * @private
     * @method _parseCommandUpdate
     *
     * @param {Event} event
     */
    async _parseCommandUpdate(event) {
        var
            what = event.text.split(/\s+/),
            data = null;

        // No need to go further
        if (!this._isAdmin(event.user)) {
            this._answer(event.channel, this._lang.ANSWER_ADMIN_ACCESS_REQUIRED, event.user);
            return;
        }

        // Compile data object
        what = what.length > 1 ? what[1] : 'wallets';
        data = {
                   channel : {id : event.channel},
                   emitent : {id : event.user},
                   update : {what : what}
               };

        switch (what) {

            // Update wallets list
            case 'wallets':
                this._parseCommandUpdateWallets(data);
                break;

        }
    }

    /**
     * @async
     * @private
     * @method _parseCommandUpdate
     *
     * @param {Event} event
     */
    async _parseCommandUpdateWallets(data) {
        var
            raw = await this._web.users.list().catch(this._error);

        data.update.users = raw && raw.members ? raw.members.map((user) => {return user.id}) : [];

        this._event.pub(this._event.EVENT_SLACK_UPDATE_WALLETS_REQUESTED, data);
    }

    /**
     * @private
     * @method _parseCommandGetBalance
     *
     * @param {Event} event
     */
    _parseCommandGetBalance(event) {
        var
            recipient = event.text.match(new RegExp(this.REGEXP_USER, 'g')),
            data = {
                        channel : {id : event.channel},
                        emitent : {id : event.user},
                        balance : {}
                   };

        // No need to go further
        if (recipient && recipient.length) {
            data.recipient = {id : recipient[0].replace(/[<>@]/g, '')};
        }

        this._event.pub(this._event.EVENT_SLACK_BALANCE_REQUESTED, data);
    }

    /**
     * @private
     * @method _parseChannelMessage
     *
     * @param {Event} event
     */
    _parseChannelMessage(event) {
        var
            waves = 0,
            rexp = new RegExp(Self._getTaggedUser(this._me) + '\\s+' + this.REGEXP_INSTANT_MESSAGE, 'g'),
            args = event.text.match(rexp);

        // No need to go further
        if (!args) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Get recipient id and transfer amount
        args = args ? args[0].replace(rexp, '$1 $3').split(' ') : null;

        // No need to go further
        if (!(args instanceof Array) || args.length != 2) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Create and send transfer request object
        this._finishParsing(event.channel, false, event.user, args[1], args[0]);
    }

    /**
     * @private
     * @method _parseInstantMessage
     *
     * @param {Event} event
     */
    _parseInstantMessage(event) {
        var
            waves = 0,
            rexp = new RegExp('^' + this.REGEXP_INSTANT_MESSAGE, 'g'),
            args = event.text.match(rexp);

        // No need to go further
        if (!args) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Get recipient id and transfer amount
        args = args ? args[0].replace(rexp, '$1 $3').split(' ') : null;

        // No need to go further
        if (!(args instanceof Array) || args.length != 2) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Create and send transfer request object
        this._finishParsing(event.channel, true, event.user, args[1], args[0]);
    }

    /**
     * @private
     * @method _parseReactionMessage
     *
     * @param {Event} event
     */
    _parseReactionMessage(event) {
        // No need to go further
        if (!event.item_user) {
            // Don't know who's the recipient
            return;
        } else if (CONF.SLACK_API.REWARDED_REACTIONS.indexOf(event.reaction) === -1) {
            // Filter unholded reactions
            return;
        }

        // Create and send transfer request object
        this._finishParsing(
            event.channel,
            false,
            event.user,
            event.item_user,
            1,
            false
        );
    }

    /**
     * @private
     * @method _finishParsing
     *
     * @param {string} channel
     * @param {boolean} im
     * @param {string} emitent
     * @param {number} recipient
     * @param {string} amount
     * @param {boolean} answer
     *
     * @fires this._event.EVENT_SLACK_WAVES_GRANTED
     */
    _finishParsing(channel, im, emitent, recipient, amount, answer = true) {
        amount = Math.floor(amount);

        // No need to go further
        if (this._isMe(recipient)) {
            // Don't transfer to bot
            this._answer(channel, this._lang.ANSWER_NOT_TO_MYSELF, emitent);
            return;
        } else if (this._isSame(emitent, recipient)) {
            // Don't transfer to yourself
            this._answer(channel, this._lang.ANSWER_NOT_TO_YOURSELF, emitent);
            return;
        } else if (isNaN(amount)) {
            // Not a number parsed as amount
            this._answer(channel, this._lang.ANSWER_INCORRECT_SYNTAX, emitent);
            return;
        }

        // Send transfer information object to other modules
        this._event.pub(this._event.EVENT_SLACK_WAVES_GRANTED, {
            channel : {id : channel},
            emitent : {id : emitent},
            recipient : {id : recipient},
            transfer : {amount}
        });

        // Send a success answer
        if (answer !== false) {
            this._answer(channel, this._lang.ANSWER_THANK_YOU, emitent);
        }
    }

}

/**
 * @exports WavesSlackRewardBot.Slack
 */
module.exports = Self;
