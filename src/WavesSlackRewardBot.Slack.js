/**
 * @const {object} CONF
 */
// const CONF = require('../conf.json');
const CONF = process.argv[2] ?
             require(`../conf.${process.argv[2]}.json`) :
             require('../conf.mainnet.json');

/**
 * @const {WavesSlackRewardBot.Request} Request
 */
const Request = require('./WavesSlackRewardBot.Request.js');

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
     * @const {string} CMD_TEST
     */
    static get CMD_TEST() {
        return 'test'
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
    static get CMD_WALLETS() {
        return 'wallets'
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
     * @const {string} EVENT_MESSAGE
     */
    static get EVENT_MESSAGE() {
        return 'message';
    }

    /**
     * @static
     * @const {string} EVENT_TEAM_JOIN
     */
    static get EVENT_TEAM_JOIN() {
        return 'team_join';
    }

    /**
     * @static
     * @const {string} EVENT_IM_CREATED
     */
    static get EVENT_IM_CREATED() {
        return 'im_created';
    }

    /**
     * @static
     * @const {string} EVENT_REACTION_ADDED
     */
    static get EVENT_REACTION_ADDED() {
        return 'reaction_added'
    }

    /**
     * @static
     * @const {Array} CMD_LIST
     */
    static get CMD_LIST() {
        return [
            Self.CMD_HELP,
            Self.CMD_PING,
            Self.CMD_TEST,
            Self.CMD_WHOIS,
            Self.CMD_WHOAMI,
            Self.CMD_GET_SEED,
            Self.CMD_GET_STAT,
            Self.CMD_GET_ADDRESS,
            Self.CMD_GET_BALANCE,
            Self.CMD_UPDATE,
            Self.CMD_WALLETS
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
               ')[\\s\\S]+<@([^>]+)>([\\s\\S]*)';
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
        this._rtm.on(Self.EVENT_MESSAGE, this._routeMessages);
        this._rtm.on(Self.EVENT_TEAM_JOIN, this._routeMessages);
        this._rtm.on(Self.EVENT_IM_CREATED, this._routeMessages);
        this._rtm.on(Self.EVENT_REACTION_ADDED, this._routeMessages);

        // Modules events
        this._event.sub(this._event.EVENT_NODE_REQUEST_ABORTED, this._route);
        this._event.sub(this._event.EVENT_NODE_REQUEST_FINISHED, this._route);
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
        this._event.sub(this._event.EVENT_STORAGE_GET_WALLETS_LIST_FAILED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_GET_WALLETS_LIST_SUCCEEDED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_GET_WALLETS_TO_BURN_FAILED, this._route);
        this._event.sub(this._event.EVENT_STORAGE_GET_WALLETS_TO_BURN_SUCCEEDED, this._route);
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
                    this._uploadStat(event.data);
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
                this._answerUserAddress(event.data);
                break;

            // Answer that stat request failed
            case this._event.EVENT_STORAGE_STAT_REQUEST_FAILED:
                this._answer(event.data.channel.id, this._lang.ANSWER_STAT_REQUEST_FAILED);
                break;

            // Answer with the number of created wallets
            case this._event.EVENT_STORAGE_CREATED_NEW_WALLETS:
                this._answerNewWalletsCreated(event.data);
                break;

            // Answer with addressses list loading error
            case this._event.EVENT_STORAGE_GET_WALLETS_LIST_FAILED:
            case this._event.EVENT_STORAGE_GET_WALLETS_TO_BURN_FAILED:
                this._answer(event.data.channel.id, this._lang.ANSWER_CANNOT_COMPUTE);
                break;

            // Upload wallets list as a file
            case this._event.EVENT_STORAGE_GET_WALLETS_LIST_SUCCEEDED:
                if (event.data.wallets.action == 'list') {
                    this._uploadWalletsList(event.data);
                }
                break;

            // Upload wallets burned transactions
            case this._event.EVENT_NODE_REQUEST_FINISHED:

                if (event.data.wallets) {
                    switch (event.data.wallets.action) {

                        case 'burn':
                            this._uploadBurnedWallets(event.data);
                            break;

                        case 'refill':
                            this._uploadRefilledWallets(event.data);
                            break;

                    }
                }
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
            case Self.EVENT_MESSAGE:
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

            // New colleague joined
            case Self.EVENT_TEAM_JOIN:
            case Self.EVENT_IM_CREATED:
                this._answer('@UCZE3R4TV', event.type + '\n\n' + JSON.stringify(event.user));
                break;

            // Reaction message
            case Self.EVENT_REACTION_ADDED:
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
     * @async
     * @private
     * @method _upload
     *
     * @param {string} channel
     * @param {string} buffer
     * @param {string} filename
     */
    async _upload(channel, buffer, filename) {
        this._web.files.upload({
            filename : filename,
            filetype : 'txt',
            content : buffer,
            channels : channel
        }).catch(this._error);
    }

    /**
     * @private
     * @method _answerHelp
     *
     * @param {Event} event
     */
    _answerHelp(event) {
        if (this._isAdmin(event.user)) {
            this._answer(event.channel, this._lang.ANSWER_ADMIN_HELP, event.user);
        } else {
            this._answer(event.channel, this._lang.ANSWER_HELP, event.user);
        }
    }

    /**
     * @private
     * @method _answerNewWalletsCreated
     *
     * @param {object} data
     */
    _answerNewWalletsCreated(data) {
        var
            created = data.wallets.list.length,
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
            text = data.transfer.message ?
                   this._lang.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT_WITH_MESSAGE :
                   this._lang.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT;
            text = text.
                   replace('${user}', Self._getTaggedUser(data.emitent.id)).
                   replace('${link}', link).
                   replace('${amount}', data.transfer.amount).
                   replace('${pluralized}', this._lang.pluralize(
                       data.transfer.amount,
                       this._lang.CURRENCY_ONE,
                       this._lang.CURRENCY_TWO,
                       this._lang.CURRENCY_ALL
                   )).
                   replace('${message}', data.transfer.message);

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
                   replace('${phrase}', data.emitent.phrase);

        this._answer(data.channel.id, text);
    }

    /**
     * @async
     * @private
     * @method _answerUserAddress
     *
     * @param {object} data
     */
    async _answerUserAddress(data) {
        var
            text = '';

        if (data.address.uid == data.emitent.id) {
            text = this._lang.ANSWER_YOUR_ADDRESS_IS;
        } else {
            text = this._lang.ANSWER_USER_ADDRESS_IS.
                   replace('${user}', Self._getTaggedUser(data.address.uid));
        }

        text = text.replace('${address}', data.address.id);

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
     * @method _uploadBurnedWallets
     *
     * @param {object} data
     */
    async _uploadBurnedWallets(data) {
        var
            it0 = -1,
            width = this._lang.BURN_TABLE_COL_WIDTH,
            space = this._lang.BURN_TABLE_COL_SPACE,
            al0 = '',
            when = '',
            title = this._lang[`BURN_TABLE_TITLE`] + '',
            title1 = this._lang.BURN_TABLE_BURNED_WALLETS_TITLE,
            title2 = this._lang.BURN_TABLE_REJECTED_WALLETS_TITLE,
            buffer = '',
            string = '',
            now = new Date(),
            wallet = null;

        when = `${now.getDate()}.${now.getMonth()}.${now.getFullYear()}`;
        buffer += `${title} (${when}):\n\n`;

        // Table top
        string = ('').padEnd(width + space, '=');
        buffer += `=${string}=\n`;

        // Columns titles
        string = (title1).padEnd(width, ' ');
        buffer += ` ${string} \n`;

        string = ('').padEnd(width + space, '-');
        buffer += ` ${string}\n`;

        // Table content
        for (al0 in data.wallets.burned) {
            wallet = data.wallets.burned[al0];

            // Columns titles
            string = (wallet.wallet_address + '').padEnd(width, ' ');
            buffer += ` ${string} \n`;
        }

        string = ('').padEnd(width + space, '-') + '\n\n ';
        string += (title2).padEnd(width, ' ') + '\n ';
        string += ('').padEnd(width + space, '-');
        buffer += ` ${string}\n`;

        // Table content
        for (al0 in data.wallets.rejected) {
            wallet = data.wallets.rejected[al0];

            // Columns titles
            string = (wallet.wallet_address + '').padEnd(width, ' ');
            buffer += ` ${string} \n`;
        }

        // Table bottom
        string = ('').padEnd(width + space, '=');
        buffer += `=${string}=\n`;

        // Upload answer
        this._upload(data.channel.id, buffer, `burnded-wallets-${when}.txt`);
    }

    /**
     * @async
     * @private
     * @method _uploadRefilledWallets
     *
     * @param {object} data
     */
    _uploadRefilledWallets(data) {
        var
            refilled = data.wallets.succeeded.length,
            text = this._lang.ANSWER_ALL_WALLETS_REFILLED.
                   replace('${count}', refilled).
                   replace('${pluralized}', this._lang.pluralize(
                       refilled,
                       this._lang.WALLET_ONE,
                       this._lang.WALLET_TWO,
                       this._lang.WALLET_ALL
                   ));

        this._answer(data.channel.id, text);
    }

    /**
     * @async
     * @private
     * @method _uploadStat
     *
     * @param {object} data
     */
    async _uploadStat(data) {
        // No need to go further
        if (!data.stat.list) {
            return;
        }

        var
            it0 = -1,
            sum = 0,
            space = this._lang.STAT_TABLE_COL_SPACE,
            width1 = this._lang.STAT_TABLE_COL1_WIDTH,
            width2 = this._lang.STAT_TABLE_COL2_WIDTH,
            last = data.stat.list.length - 1,
            id = '',
            alias = data.stat.alias.toUpperCase(),
            title = this._lang[`STAT_${alias}_TABLE_TITLE`] + '',
            total = this._lang[`STAT_${alias}_TABLE_TOTAL`] ?
                    this._lang[`STAT_${alias}_TABLE_TOTAL`] + '' :
                    '',
            title1 = this._lang[`STAT_${alias}_TABLE_COL1_TITLE`] + '',
            title2 = this._lang[`STAT_${alias}_TABLE_COL2_TITLE`] + '',
            string1 = '',
            string2 = '',
            buffer = '',
            interval = '',
            now = new Date(),
            list = data.stat.list,
            item = null,
            user = null;

        interval += data.stat.alias != 'balances' ? '1-' : '';
        interval += `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;

        // Table title
        buffer += `${title} (${interval}):\n\n`;

        // Table top
        string1 = ('').padEnd(width1 + width2 + space, '=');
        buffer += `=${string1}=\n`;

        // Columns titles
        string1 = (title1).padEnd(width1, ' ');
        string2 = (title2).padStart(width2, ' ');
        buffer += ` ${string1}  ${string2} \n`;

        string1 = ('').padEnd(width1 + width2 + space, '-');
        buffer += ` ${string1}\n`;

        // Table content
        if (data.stat.list.length) {
            // Snow rows
            while (++it0 < data.stat.list.length) {
                item = list[it0];

                // Get slack user id
                switch (data.stat.alias) {

                    case 'month':
                    case 'balances':
                        id = item.recipient_id;
                        break;

                    case 'generosity':
                        id = item.emitent_id;
                        break;

                }

                // Get user object
                user = await this._getUserInfo(id).
                       catch(this._error);
                user = user && user.user && user.user.profile ?
                       user.user.profile :
                       {};

                // Columns titles
                string1 = ('@' + user.real_name_normalized + '').padEnd(width1, ' ');
                string2 = (item.transaction_amount + '').padStart(width2, ' ');
                buffer += ` ${string1}  ${string2}\n`;

                sum += +item.transaction_amount;
            }

            // Count totals
            if (total && sum && !isNaN(sum)) {
                // Table total
                string1 = ('').padEnd(width1 + width2 + space, '-');
                buffer += ` ${string1}\n`;

                string1 = (total).padEnd(width1, ' ');
                string2 = (sum + '').padStart(width2, ' ');
                buffer += ` ${string1}  ${string2}\n`;
            }
        } else {
            // Show nothing
            string1 = (Self.STAT_TABLE_IS_EMPTY).padEnd(width1 + width2 + space, ' ');
            buffer += ` ${string1}\n`
        }

        // Table bottom
        string1 = ('').padEnd(width1 + width2 + space, '=');
        buffer += `=${string1}=\n`;

        // Upload answer
        this._upload(data.channel.id, buffer, `stat-${data.stat.alias}-${interval}.txt`);
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
        } else if (!who) {
            return;
        }

        // Get tagged user or just user id
        who = who.substring(0, 2) == '<@' ?
              who.replace('<', '').replace('>', '').replace('@', '') :
              Self._getTaggedUser(who);

        // Answer
        this._answer(event.channel, who, event.user)
    }

    /**
     * @private
     * @method _uploadWalletsList
     *
     * @param {object} data
     */
    _uploadWalletsList(data) {
        // No need to go further
        if (
            !data ||
            !data.wallets ||
            !(data.wallets.list instanceof Array) ||
            !data.wallets.list.length
        ) {
            this._answer(data.channel.id, this._lang.ANSWER_WALLETS_LIST_REQUEST_NOTHING);
            return;
        }

        // Send list via file api
        this._upload(data.channel.id, data.wallets.list.join('\n'), 'wallets-list.txt');
    }

    /**
     * @async
     * @private
     * @method _getUserInfo
     *
     * @param {string} id
     */
    async _getUserInfo(id) {
        return await this._web.users.info({user : id}).
               catch(this._error);
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
     * @param {number} offset
     * @param {Event} event
     */
    async _parseCommandMessage(offset, event) {
        switch (Self.CMD_LIST[offset]) {

            // Check if bot's alive
            case Self.CMD_PING:
                this._answer(event.channel, this._lang.ANSWER_PONG, event.user);
                break;

            // Get help
            case Self.CMD_HELP:
                this._answerHelp(event);
                break;

            // Test new functionality
            case Self.CMD_TEST:
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
                this._answer(event.channel, this._lang.ANSWER_COMPUTING);
                this._event.pub(this._event.EVENT_SLACK_STAT_REQUESTED, {
                    channel : {id : event.channel},
                    emitent : {id : event.user},
                    stat : {alias : event.text.split(/\s+/)[1]}
                });
                break;

            // Get my wallet address
            case Self.CMD_GET_ADDRESS:
                this._parseCommandGetAddress(event);
                break;

            // Get my wallet balance
            case Self.CMD_GET_BALANCE:
                this._parseCommandGetBalance(event);
                break;

            // Wallets commands
            case Self.CMD_WALLETS:
                this._parseCommandWallets(event);
                break;

        }
    }

    /**
     * @private
     * @method _parseCommandGetAddress
     *
     * @param {Event} event
     */
    _parseCommandGetAddress(event) {
        var
            user = event.user,
            args = event.text.split(' ');

        // Change user to given in second argument
        if (this._isAdmin(event.user) && args[1]) {
            user = args[1].replace('<', '').replace('>', '').replace('@', '');
        }

        this._event.pub(this._event.EVENT_SLACK_ADDRESS_REQUESTED, {
            channel : {id : event.channel},
            emitent : {id : event.user},
            address : {uid : user}
        });
    }

    /**
     ; @async
     * @private
     * @method _parseCommandWallets
     *
     * @param {Event} event
     */
    async _parseCommandWallets(event) {
        var
            basic = 'list',
            action = '',
            raw = null,
            data = null;

        // No need to go further
        if (!this._isAdmin(event.user)) {
            this._answer(event.channel, this._lang.ANSWER_ADMIN_ACCESS_REQUIRED, event.user);
            return;
        }

        // Tell that request's in progress
        this._answer(event.channel, this._lang.ANSWER_COMPUTING);

        // Prepare data
        raw = event.text.split(/\s+/);
        action = (raw instanceof Array) && raw.length > 1 ? raw[1] : basic;
        data = {
                   channel : {id : event.channel},
                   emitent : {id : event.user},
                   wallets : {action : action}
               };

        switch (action) {

            // Burn wallets underflow
            case 'burn':
                this._parseCommandWalletsBurn(data)
                break;

            // Get wallets list
            case 'list':
                this._parseCommandWalletsList(data);
                break;

            // Update wallets list
            case 'update':
                this._parseCommandWalletsUpdate(data);
                break;

            // Refill wallets
            case 'refill':
                this._parseCommandWalletsRefill(data);
                break;

        }
    }

    /**
     * @async
     * @private
     * @method _parseCommandWalletsRefill
     *
     * @param {object} data
     */
    async _parseCommandWalletsRefill(data) {
        data.wallets.list = [];

        this._event.pub(this._event.EVENT_SLACK_WALLETS_REFILL_REQUESTED, data);
    }

    /**
     * @async
     * @private
     * @method _parseCommandWalletsBurn
     *
     * @param {object} data
     */
    async _parseCommandWalletsBurn(data) {
        data.wallets.list = [];

        this._event.pub(this._event.EVENT_SLACK_WALLETS_BURN_REQUESTED, data);
    }

    /**
     * @async
     * @private
     * @method _parseCommandWalletsList
     *
     * @param {object} data
     */
    async _parseCommandWalletsList(data) {
        data.wallets.list = [];

        this._event.pub(this._event.EVENT_SLACK_WALLETS_LIST_REQUESTED, data);
    }

    /**
     * @async
     * @private
     * @method _parseCommandWalletsUpdate
     *
     * @param {object} data
     */
    async _parseCommandWalletsUpdate(data) {
        var
            raw = await this._web.users.list().catch(this._error);

        data.wallets.list = raw && raw.members ? 
                            raw.members.map((user) => {return user.id}) :
                            [];

        this._event.pub(this._event.EVENT_SLACK_WALLETS_UPDATE_REQUESTED, data);
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
            message = '',
            rexp = new RegExp(Self._getTaggedUser(this._me) + '\\s+' + this.REGEXP_INSTANT_MESSAGE, 'g'),
            args = event.text.match(rexp);

        // No need to go further
        if (!args) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Get recipient id and transfer amount
        args = args ? args[0].replace(rexp, '$1 $3 $4').split(' ') : null;

        message = args.length > 2 ? args.slice(2).join(' ') : '';
        message = message.replace(/^\s{1,}/, '').replace(/\s{1,}$/, '');
        message = message.substring(0, 150);

        // No need to go further
        if (!(args instanceof Array)) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Create and send transfer request object
        this._finishParsing(event.channel, false, event.user, args[1], args[0], true, message);
    }

    /**
     * @private
     * @method _parseInstantMessage
     *
     * @param {Event} event
     */
    _parseInstantMessage(event) {
        var
            message = '',
            rexp = new RegExp('^' + this.REGEXP_INSTANT_MESSAGE, 'g'),
            args = event.text.match(rexp);

        // No need to go further
        if (!args) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Get recipient id and transfer amount
        args = args ? args[0].replace(rexp, '$1 $3 $4').split(' ') : null;

        message = args.length > 2 ? args.slice(2).join(' ') : '';
        message = message.replace(/^\s{1,}/, '').replace(/\s{1,}$/, '');
        message = message.substring(0, 150);

        // No need to go further
        if (!(args instanceof Array)) {
            this._answer(event.channel, this._lang.ANSWER_INCORRECT_SYNTAX, event.user);
            return;
        }

        // Create and send transfer request object
        this._finishParsing(event.channel, true, event.user, args[1], args[0], true, message);
    }

    /**
     * @async
     * @private
     * @method _parseReactionMessage
     *
     * @param {Event} event
     */
    async _parseReactionMessage(event) {
        var
            link = '',
            text = '',
            send = '',
            message = await this._web.chat.getPermalink({
                          channel : event.item.channel,
                          message_ts : event.item.ts
                      }).catch(this._error);

        // No need to go further
        if (!event.item_user || !message || !message.permalink) {
            // Don't know who's the recipient
            return;
        } else if (CONF.SLACK_API.REWARDED_REACTIONS.indexOf(event.reaction) === -1) {
            // Filter unholded reactions
            return;
        }

        // Get and format permalink to message
        link = message.permalink;
        text = link ? link.split('/').slice(4).join('/') : '';
        send = this._lang.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT_FOR_REACTION.
               replace('${link}', link).
               replace('${text}', text);

        // Create and send transfer request object
        this._finishParsing(
            event.channel,
            false,
            event.user,
            event.item_user,
            1,
            false,
            link && text ? send : ''
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
     * @param {string} message
     *
     * @fires this._event.EVENT_SLACK_WAVES_GRANTED
     */
    _finishParsing(channel, im, emitent, recipient, amount, answer = true, message = '') {
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
            transfer : {amount, message}
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
