/**
 * Slack bot working with the Wavesplatform.API 
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 1.0
 * @license MIT
 *
 * @module WavesSlackRewardBot
 */



// Conf
const CONF = require('./conf.json');

// libs
const Restler = require('restler');
const {Client} = require('pg');
const {EventEmitter} = require('events');
const {RTMClient, WebClient} = require('@slack/client');
const WavesAPI = require('@waves/waves-api');
const {transfer} = require('waves-transactions');



/**
 * @class WavesSlackRewardBot
 */
let WavesSlackRewardBot = (function() {

    // Common event emitter initialization
    let Emitter = new EventEmitter;

    // Class definition
    class Self {

        /**
         * @static
         * @const {string} MESSAGE_NODE_CONNECTED
         */
        static get MESSAGE_NODE_CONNECTED() {
            return `Waves module is ready`;
        }

        /**
         * @static
         * @const {string} MESSAGE_NODE_NOT_CONNECTED
         */
        static get MESSAGE_NODE_NOT_CONNECTED() {
            return `Waves module isn't ready`;
        }

        /**
         * @static
         * @const {string} MESSAGE_SLACK_CONNECTED
         */
        static get MESSAGE_SLACK_CONNECTED() {
            return `Slack module is ready`;
        }

        /**
         * @static
         * @const {string} MESSAGE_SLACK_NOT_CONNECTED
         */
        static get MESSAGE_SLACK_NOT_CONNECTED() {
            return `Slack module isn't ready`;
        }

        /**
         * @static
         * @const {string} MESSAGE_STORAGE_CONNECTED
         */
        static get MESSAGE_STORAGE_CONNECTED() {
            return `Storage module is ready`;
        }

        /**
         * @static
         * @const {string} MESSAGE_STORAGE_NOT_CONNECTED
         */
        static get MESSAGE_STORAGE_NOT_CONNECTED() {
            return `Storage module isn't ready`;
        }

        /**
         * @static
         * @member {Emitter} Emitter
         */
        static get Emitter() {
            return Emitter;
        }

        /**
         * @static
         * @method pub
         *
         * @param {string} type
         * @param {object} data
         */
        static pub(type, data = null) {
            data = data ? data : null;

            Self.Emitter.emit(type, {type, data});
        }

        /**
         * @static
         * @method sub
         *
         * @param {string} type
         * @param {Function} handler
         */
        static sub(type, handler) {
            Self.Emitter.on(type, handler);
        }

        /**
         * @static
         * @method error
         *
         * @param {object|Error} exc
         */
        static error(exc) {
            if (CONF.DEV) {
                console.log(exc);
            }
        }

        /**
         * @constructor
         */
        constructor() {
            // Bind some methods to the current context
            this._route = this._route.bind(this);

            // Add event handlers
            this._live();

            // Init submodules
            this._modules = {
                node : new Self.Node(),
                slack : new Self.Slack(),
                storage : new Self.Storage()
            }
        }

        /**
         * @private
         * @method _live
         */
        _live() {
            Self.sub(Self.Node.EVENT_NODE_CONNECTED, this._route);
            Self.sub(Self.Node.EVENT_NODE_NOT_CONNECTED, this._route);
            Self.sub(Self.Slack.EVENT_SLACK_CONNECTED, this._route);
            Self.sub(Self.Slack.EVENT_SLACK_NOT_CONNECTED, this._route);
            Self.sub(Self.Storage.EVENT_STORAGE_CONNECTED, this._route);
            Self.sub(Self.Storage.EVENT_STORAGE_NOT_CONNECTED, this._route);
        }

        /**
         * @private
         * @method _route
         *
         * @param {Event} event
         */
        _route(event) {
            // No need to go further
            if (!event || !event.type) {
                return;
            }

            switch (event.type) {

                // Waves API module is ready
                case Self.Node.EVENT_NODE_CONNECTED:
                    console.log(Self.MESSAGE_NODE_CONNECTED);
                    break;

                // Waves API module isn't ready
                case Self.Node.EVENT_NODE_NOT_CONNECTED:
                    console.log(Self.MESSAGE_NODE_NOT_CONNECTED);
                    break;

                // Slack module is ready
                case Self.Slack.EVENT_SLACK_CONNECTED:
                    console.log(Self.MESSAGE_SLACK_CONNECTED);
                    break;

                // Slack module isn't ready
                case Self.Slack.EVENT_SLACK_NOT_CONNECTED:
                    console.log(Self.MESSAGE_SLACK_NOT_CONNECTED);
                    break;

                // Storage module is ready
                case Self.Storage.EVENT_STORAGE_CONNECTED:
                    console.log(Self.MESSAGE_STORAGE_CONNECTED);
                    break;

                // Storage module isn't ready
                case Self.Storage.EVENT_STORAGE_NOT_CONNECTED:
                    console.log(Self.MESSAGE_STORAGE_NOT_CONNECTED);
                    break;

            }
        }

    }

    // Class export
    return Self;

})();



/**
 * @class WavesSlackRewardBot.Node
 *
 * @see https://github.com/wavesplatform/waves-api
 * @see https://www.npmjs.com/package/waves-transactions
 * @see https://github.com/danwrong/restler
 */
WavesSlackRewardBot.Node = (function() {

    // Root module
    let Super = this;

    // Class definition
    class Self {

        /**
         * @static
         * @const {string} EVENT_NODE_CONNECTED
         */
        static get EVENT_NODE_CONNECTED() {
            return 'nodeConnected';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_NOT_CONNECTED
         */
        static get EVENT_NODE_NOT_CONNECTED() {
            return 'nodeNotConnected';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_TRANSFER_ABORTED
         */
        static get EVENT_NODE_TRANSFER_ABORTED() {
            return 'nodeTransferAborted';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_TRANSFER_REJECTED
         */
        static get EVENT_NODE_TRANSFER_REJECTED() {
            return 'nodeTransferRejected';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_TRANSFER_SUCCEEDED
         */
        static get EVENT_NODE_TRANSFER_SUCCEEDED() {
            return 'nodeTransferSucceeded';
        }

        /**
         * @constructor
         *
         * @fires Self.EVENT_NODE_CONNECTED
         * @fires Self.EVENT_NODE_NOT_CONNECTED
         */
        constructor() {
            // Bind some methods to the current context
            this._route = this._route.bind(this);

            // Add event handlers
            this._live();

            // Initiate
            try {
                this._module = WavesAPI.create(WavesAPI[CONF.WAVES_API.CONFIG_ALIAS]);
                Super.pub(Self.EVENT_NODE_CONNECTED);
            } catch (exc) {
                Super.pub(Self.EVENT_NODE_NOT_CONNECTED);
                Super.error(exc);
            }
        }

        /**
         * @private
         * @method _live
         */
        _live() {
            // Modules events
            Super.sub(Super.Storage.EVENT_STORAGE_TRANSFER_WAVES, this._route);
        }

        /**
         * @private
         * @method _route
         *
         * @param {Event} event
         */
        _route(event) {
            // No need to go further
            if (!event || !event.type) {
                return;
            }

            switch (event.type) {

                // Sent Waves transfer request
                case Super.Storage.EVENT_STORAGE_TRANSFER_WAVES:
                    this._transferWaves(event.data);
                    break;

            }
        }

        /**
         * @private
         * @method _transferWaves
         *
         * @param {object} data
         *
         * @fires Self.EVENT_NODE_TRANSFER_REJECTED
         * @fires Self.EVENT_NODE_TRANSFER_ABORTED
         * @fires Self.EVENT_NODE_TRANSFER_SUCCEEDED
         */
        _transferWaves(data) {
            var
                params = {
                             alias : 'SlackBotTransfer',
                             amount : data.transfer.amount,
                             recipient : data.recipient.address
                         },
                request = transfer(data.emitent.phrase, params);

            // Send reqdy and signed request to Waves api
            Restler.postJson(CONF.WAVES_API.BROADCAST_PATH, request).
            on('fail', (res, xhr) => {
                data.transfer.reject = true;
                data.transfer.answer = res.message;
                Super.pub(Self.EVENT_NODE_TRANSFER_REJECTED, data);
            }).
            on('error', (exc, xhr) => {
                data.transfer.error = true;
                Super.pub(Self.EVENT_NODE_TRANSFER_ABORTED, data);
            }).
            on('success', (res, xhr) => {
                data.transfer.success = true;
                data.transfer.id = res.id;
                Super.pub(Self.EVENT_NODE_TRANSFER_SUCCEEDED, data);
            });
        }
    }

    // Class export
    return Self;

}).call(WavesSlackRewardBot);



/**
 * @class WavesSlackRewardBot.Slack
 *
 * @see https://github.com/slackapi/node-slack-sdk
 * @see https://slackapi.github.io/node-slack-sdk/web_api
 * @see https://slackapi.github.io/node-slack-sdk/rtm_api
 */
WavesSlackRewardBot.Slack = (function() {

    // Root module
    let Super = this;

    // Class definition
    class Self {

        /**
         * @static
         * @const {Array} WAVES_ALIASES
         */
        static get WAVES_ALIASES() {
            return ['thake', 'coin', 'token', 'wave'];
        }

        /**
         * @static
         * @const {Array} REWARDED_REACTIONS
         */
        static get REWARDED_REACTIONS() {
            return ['+1', 'heart'];
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_CONNECTED
         */
        static get EVENT_SLACK_CONNECTED() {
            return 'slackConnected';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_NOT_CONNECTED
         */
        static get EVENT_SLACK_NOT_CONNECTED() {
            return 'slackNotConnected';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_WAVES_GRANTED
         */
        static get EVENT_SLACK_WAVES_GRANTED() {
            return 'slackWavesGranted';
        }

        /**
         * @static
         * @const {string} REGEXP_INSTANT_MESSAGE
         */
        static get REGEXP_INSTANT_MESSAGE() {
            return `[\\s\\S]*(\\d+)[\\s\\S]+(${Self.WAVES_ALIASES.join('s?|')}s?)[\\s\\S]+<@([^>]+)>[\\s\\S]*`;
        }

        /**
         * @static
         * @const {string} ANSWER_TRANSACTION_ABORTED
         */
        static get ANSWER_TRANSACTION_ABORTED() {
            return `
                Oops! Seems like some serious internal error has been happened while transaction process.
                Try to make it later.
            `;
        }

        /**
         * @static
         * @const {string} ANSWER_TRANSACTION_REJECTED
         */
        static get ANSWER_TRANSACTION_REJECTED() {
            return `Your transaction rejected.`;
        }

        /**
         * @static
         * @const {string} ANSWER_TRANSACTION_COMPLETED
         */
        static get ANSWER_TRANSACTION_COMPLETED() {
            return `Your transaction completed.`;
        }

        /**
         * @static
         * @const {string} ANSWER_THANK_YOU
         */
        static get ANSWER_THANK_YOU() {
            return `Will try to do immediately. Thanks for your generosity.`;
        }

        /**
         * @static
         * @const {string} ANSWER_NOT_TO_MYSELF
         */
        static get ANSWER_NOT_TO_MYSELF() {
            return `I cannot afford it. I'm at the service.`;
        }

        /**
         * @static
         * @const {string} ANSWER_NOT_TO_YOURSELF
         */
        static get ANSWER_NOT_TO_YOURSELF() {
            return `You're trying to transfer to yourself.`;
        }

        /**
         * @static
         * @const {string} ANSWER_INCORRECT_SYNTAX
         */
        static get ANSWER_INCORRECT_SYNTAX() {
            return `Incorrect syntax. You should write for example: «10 thakes @user_nick»`;
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
         * @fires Self.EVENT_SLACK_NOT_CONNECTED
         * @fires Self.EVENT_SLACK_CONNECTED
         */
        constructor() {
            // Bind some methods to the current context
            this._route = this._route.bind(this);
            this._routeMessages = this._routeMessages.bind(this);

            // For interactive operations
            this._rtm = new RTMClient(CONF.SLACK_API.token);
            this._rtm.start();

            // For simple operations
            this._web = new WebClient(CONF.SLACK_API.token);

            // Add event handlers
            this._live();

            // No need to go further
            if (!this._rtm || !this._web) {
                Super.pub(Self.EVENT_SLACK_NOT_CONNECTED);
                return;
            }

            // Everything's ok
            Super.pub(Self.EVENT_SLACK_CONNECTED);
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
         * @method _isIM
         *
         * @param {string} id
         *
         * @returns {boolean}
         */
        async _isIM(id) {
            var
                info = await this._getConversationInfo(id).
                       catch(Super.error);

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
            Super.sub(Super.Node.EVENT_NODE_TRANSFER_ABORTED, this._route);
            Super.sub(Super.Node.EVENT_NODE_TRANSFER_REJECTED, this._route);
            Super.sub(Super.Storage.EVENT_STORAGE_TRANSFER_COMPLETED, this._route);
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

                // Tell that transfer was aborted
                case Super.Node.EVENT_NODE_TRANSFER_ABORTED:
                    this._answer(
                        event.channel.id,
                        Self.ANSWER_TRANSACTION_ABORTED,
                        event.emitent.id
                    );
                    break;

                // Tell that transfer was rejected
                case Super.Node.EVENT_NODE_TRANSFER_REJECTED:
                    this._answer(
                        event.data.channel.id,
                        (
                            Self.ANSWER_TRANSACTION_REJECTED +
                            (
                                event.data.transfer.answer ?
                                ' ' + event.data.transfer.answer :
                                ''
                            )
                        ),
                        event.data.emitent.id
                    );
                    break;

                // Tell that transfer was completed
                case Super.Storage.EVENT_STORAGE_TRANSFER_COMPLETED:
                    this._answer(
                        event.data.channel.id,
                        (
                            Self.ANSWER_TRANSACTION_COMPLETED +
                            ` (${CONF.WAVES_API.TRANSFER_LINK}${event.data.transfer.id})`
                        ),
                        event.data.emitent.id
                    );
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

            // Apply message parsers
            switch (event.type) {

                // Regular message
                case 'message':
                    if (await this._isIM(event.channel).catch(Super.error)) {
                        this._parseInstantMessage(event);
                    } else if (event.text.indexOf(this._me) === 2) {
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
         */
        async _answer(channel, text, uid) {
            var
                im = await this._isIM(channel).catch(Super.error);

            text = (uid && !im ? Self._getTaggedUser(uid) : '') + ' ' + text;

            await this._web.chat.postMessage({channel, text}).
            catch(Super.error);
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
                   catch(Super.error);
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
                rexp = new RegExp(Self._getTaggedUser(this._me) + Self.REGEXP_INSTANT_MESSAGE, 'g'),
                args = event.text.match(rexp);

            // No need to go further
            if (!args) {
                this._answer(event.channel, Self.ANSWER_INCORRECT_SYNTAX, event.user);
                return;
            }

            // Get recipient id and transfer amount
            args = args ? args[0].replace(rexp, '$1 $3').split(' ') : null;

            // No need to go further
            if (!(args instanceof Array) || args.length != 2) {
                this._answer(event.channel, Self.ANSWER_INCORRECT_SYNTAX, event.user);
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
                rexp = new RegExp(Self.REGEXP_INSTANT_MESSAGE, 'g'),
                args = event.text.match(rexp);

            // No need to go further
            if (!args) {
                this._answer(event.channel, Self.ANSWER_INCORRECT_SYNTAX, event.user);
                return;
            }

            // Get recipient id and transfer amount
            args = args ? args[0].replace(rexp, '$1 $3').split(' ') : null;

            // No need to go further
            if (!(args instanceof Array) || args.length != 2) {
                this._answer(event.channel, Self.ANSWER_INCORRECT_SYNTAX, event.user);
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
            } else if (Self.REWARDED_REACTIONS.indexOf(event.reaction) === -1) {
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
         * @method _finishGranting
         *
         * @param {string} channel
         * @param {boolean} im
         * @param {string} emitent
         * @param {number} recipient
         * @param {string} amount
         * @param {boolean} answer
         *
         * @fires Self.EVENT_SLACK_WAVES_GRANTED
         */
        _finishParsing(channel, im, emitent, recipient, amount, answer = true) {
            amount = Math.floor(amount);

            // No need to go further
            if (this._isMe(recipient)) {
                // Don't transfer to bot
                this._answer(channel, Self.ANSWER_NOT_TO_MYSELF, emitent);
                return;
            } else if (this._isSame(emitent, recipient)) {
                // Don't transfer to yourself
                this._answer(channel, Self.ANSWER_NOT_TO_YOURSELF, emitent);
                return;
            } else if (isNaN(amount)) {
                // Not a number parsed as amount
                this._answer(channel, Self.ANSWER_INCORRECT_SYNTAX, emitent);
                return;
            }

            // Send transfer information object to other modules
            Super.pub(Self.EVENT_SLACK_WAVES_GRANTED, {
                channel : {id : channel},
                emitent : {id : emitent},
                recipient : {id : recipient},
                transfer : {amount}
            });

            // Send a success answer
            if (answer !== false) {
                this._answer(channel, Self.ANSWER_THANK_YOU, emitent);
            }
        }

    }

    // Class export
    return Self;

}).call(WavesSlackRewardBot);



/**
 * @class WavesSlackRewardBot.Storage
 *
 * @see https://node-postgres.com/
 */
WavesSlackRewardBot.Storage = (function() {

    // Root module
    let Super = this;

    // Class definition
    class Self {

        /**
         * @static
         * @const {string} SQL_GET_WALLETS_IDS
         */
        static get SQL_GET_WALLETS_IDS() {
            return `
                SELECT
                    slack_id,
                    wallet_phrase,
                    wallet_address
                FROM
                    ${CONF.DB.WALLETS_TABLE_NAME}
                WHERE
                    slack_id = $1
                OR
                    slack_id = $2
                LIMIT
                    2
            `;
        }

        /**
         * @static
         * @const {string} SQL_ADD_TRANSACTION
         */
        static get SQL_ADD_TRANSACTION() {
            return `
                INSERT INTO ${CONF.DB.TRANSACTIONS_TABLE_NAME} (
                    emitent_id,
                    recipient_id,
                    transaction_hash,
                    transaction_date,
                    transaction_amount
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
            `;
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_CONNECTED
         */
        static get EVENT_STORAGE_CONNECTED() {
            return 'storageConnected';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_NOT_CONNECTED
         */
        static get EVENT_STORAGE_NOT_CONNECTED() {
            return 'storageNotConnected';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_NO_WALLETS
         */
        static get EVENT_STORAGE_NO_WALLETS() {
            return 'storageNoWalletsFound';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_NO_EMITTER_WALLET
         */
        static get EVENT_STORAGE_NO_EMITTER_WALLET() {
            return 'storageNoEmitterWalletFound';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_NO_RECIPIENT_WALLET
         */
        static get EVENT_STORAGE_NO_RECIPIENT_WALLET() {
            return 'storageNoRecipientWalletFound';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_TRANSFER_WAVES
         */
        static get EVENT_STORAGE_TRANSFER_WAVES() {
            return 'storageWavesTransferRequested';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_TRANSFER_COMPLETED
         */
        static get EVENT_STORAGE_TRANSFER_COMPLETED() {
            return 'storageWavesTransferCompleted';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_TRANSFER_NOT_COMPLETED
         */
        static get EVENT_STORAGE_TRANSFER_NOT_COMPLETED() {
            return 'storageWavesTransferNotCompleted';
        }

        /**
         * @constructor
         */
        constructor() {
            // Bind some methods to the current context
            this._route = this._route.bind(this);

            // Add event handlers
            this._live();

            // Get link to DB client
            this._client = new Client(CONF.DB);

            // Make DB connection
            this._connect()
        }

        /**
         * @private
         * @method _live
         */
        _live() {
            // Modules events
            Super.sub(Super.Slack.EVENT_SLACK_WAVES_GRANTED, this._route);
            Super.sub(Super.Node.EVENT_NODE_TRANSFER_SUCCEEDED, this._route);
        }

        /**
         * @private
         * @method _route
         *
         * @param {Event} event
         */
        _route(event) {
            // No need to go further
            if (!event || !event.type) {
                return;
            }

            switch (event.type) {

                // Check if wallet exist and send transaction request
                case Super.Slack.EVENT_SLACK_WAVES_GRANTED:
                    this._checkWallets(event.data);
                    break;

                // Save transaction info
                case Super.Node.EVENT_NODE_TRANSFER_SUCCEEDED:
                    this._addTransaction(event.data);
                    break;

            }
        }

        /**
         * @private
         * @method _request
         *
         * @param {string} text
         * @param {Array} values
         * @param {string} rowMode
         */
        _request(text, values = [], rowMode = '') {
            // No need to go further
            if (!text) {
                return null;
            }

            return this._client.query({
                text,
                values,
                rowMode
            }).catch(Super.error);
        }

        /**
         * @async
         * @private
         * @method _connect
         *
         * @fires Self.EVENT_STORAGE_CONNECTED
         * @fires Self.EVENT_STORAGE_NOT_CONNECTED
         */
        async _connect() {
            await this._client.connect(
                () => {Super.pub(Self.EVENT_STORAGE_CONNECTED)},
                (exc) => {Super.pub(Self.EVENT_STORAGE_NOT_CONNECTED, exc)}
            );
        }

        /**
         * @async
         * @private
         * @method _checkWallets
         *
         * @param {object} data
         *
         * @fires Self.EVENT_STORAGE_NO_WALLETS
         * @fires Self.EVENT_STORAGE_NO_EMITTER_WALLET
         * @fires Self.EVENT_STORAGE_NO_RECIPIENT_WALLET
         * @fires Self.EVENT_STORAGE_TRANSFER_WAVES
         */
        async _checkWallets(data) {
            var
                wallets = await this._request(
                              Self.SQL_GET_WALLETS_IDS,
                              [data.emitent.id, data.recipient.id],
                              'array'
                          ).catch(Super.error);

            // No need to go further
            if (!wallets || !wallets.rowCount) {
                Super.pub(Self.EVENT_STORAGE_NO_WALLETS, data);
                return;
            }

            // Add address and keyphrase
            wallets.rows.forEach((row) => {
                if (row[0] == data.emitent.id) {
                    data.emitent.phrase = row[1];
                } else if (row[0] == data.recipient.id) {
                    data.recipient.address = row[2];
                }
            });

            // No need to go further
            if (!data.emitent.phrase) {
                Super.pub(Self.EVENT_STORAGE_NO_EMITTER_WALLET, data);
                return;
            } else if (!data.recipient.address) {
                Super.pub(Self.EVENT_STORAGE_NO_RECIPIENT_WALLET, data);
                return;
            }

            Super.pub(Self.EVENT_STORAGE_TRANSFER_WAVES, data);
        }

        /**
         * @async
         * @private
         * @method _addTransaction
         *
         * @param {object} data
         *
         * @fires Self.EVENT_STORAGE_TRANSFER_NOT_COMPLETED
         * @fires Self.EVENT_STORAGE_TRANSFER_COMPLETED
         */
        async _addTransaction(data) {
            var
                res = await this._request(
                          Self.SQL_ADD_TRANSACTION,
                          [
                               data.emitent.id,
                               data.recipient.id,
                               data.transfer.id,
                               new Date(),
                               data.transfer.amount
                          ]
                      ).catch(Super.error);

            // No need to go further
            if (!res || !res.rowCount) {
                Super.pub(Self.EVENT_STORAGE_TRANSFER_NOT_COMPLETED, data);
                return;
            }

            Super.pub(Self.EVENT_STORAGE_TRANSFER_COMPLETED, data);
        }

    }

    // Class export
    return Self;

}).call(WavesSlackRewardBot);



// Export module
module.exports = WavesSlackRewardBot;
