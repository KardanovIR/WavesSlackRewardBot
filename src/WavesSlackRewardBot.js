/**
 * Slack bot working with the Wavesplatform.API 
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 1.0
 * @license MIT
 *
 * @see https://www.npmjs.com/package/forever
 * @see https://inch-ci.org/github/foreverjs/forever
 *
 * $ forever start /home/user/forever/development.son
 * $ forever stop BillyBot
 */



// Conf
const CONF = require('../conf.json');

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
         * @static
         * @method pluralize
         *
         * @param   {number} num
         * @param   {string|Array} one
         * @param   {string=} two
         * @param   {string=} all
         *
         * @returns {string}
         */
        static pluralize(num, one, two, all) {
            if (one instanceof Array) {
                all = one[2];
                two = one[1];
                one = one[0];
            }

            num = Math.abs(num);
            num %= 100;

            if (num >= 5 && num <= 20) {
                return all;
            }

            num %= 10;

            if (num == 1) {
                return one;
            } else if (num >= 2 && num <= 4) {
                return two;
            }

            return all;
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
            Self.Event.sub(Self.Event.EVENT_NODE_CONNECTED, this._route);
            Self.Event.sub(Self.Event.EVENT_NODE_NOT_CONNECTED, this._route);
            Self.Event.sub(Self.Event.EVENT_SLACK_CONNECTED, this._route);
            Self.Event.sub(Self.Event.EVENT_SLACK_NOT_CONNECTED, this._route);
            Self.Event.sub(Self.Event.EVENT_STORAGE_CONNECTED, this._route);
            Self.Event.sub(Self.Event.EVENT_STORAGE_NOT_CONNECTED, this._route);
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

/*
                // Waves API module is ready
                case Self.Event.EVENT_NODE_CONNECTED:
                    console.log(Self.MESSAGE_NODE_CONNECTED);
                    break;

                // Waves API module isn't ready
                case Self.Event.EVENT_NODE_NOT_CONNECTED:
                    console.log(Self.MESSAGE_NODE_NOT_CONNECTED);
                    break;

                // Slack module is ready
                case Self.Event.EVENT_SLACK_CONNECTED:
                    console.log(Self.MESSAGE_SLACK_CONNECTED);
                    break;

                // Slack module isn't ready
                case Self.Event.EVENT_SLACK_NOT_CONNECTED:
                    console.log(Self.MESSAGE_SLACK_NOT_CONNECTED);
                    break;

                // Storage module is ready
                case Self.Event.EVENT_STORAGE_CONNECTED:
                    console.log(Self.MESSAGE_STORAGE_CONNECTED);
                    break;

                // Storage module isn't ready
                case Self.Event.EVENT_STORAGE_NOT_CONNECTED:
                    console.log(Self.MESSAGE_STORAGE_NOT_CONNECTED);
                    break;
*/

            }
        }

    }

    // Class export
    return Self;

})();



/**
 * @class WavesSlackRewardBot.Event
 *
 * @see https://nodejs.org/api/events.html
 */
WavesSlackRewardBot.Event = (function() {

    // Root module
    let Super = this;

    // Common event emitter initialization
    let Emitter = new EventEmitter;

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
         * @const {string} EVENT_NODE_REQUEST_ABORTED
         */
        static get EVENT_NODE_REQUEST_ABORTED() {
            return 'nodeRequestAborted';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_REQUEST_REJECTED
         */
        static get EVENT_NODE_REQUEST_REJECTED() {
            return 'nodeRequestRejected';
        }

        /**
         * @static
         * @const {string} EVENT_NODE_REQUEST_SUCCEEDED
         */
        static get EVENT_NODE_REQUEST_SUCCEEDED() {
            return 'nodeRequestSucceeded';
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
         * @const {string} EVENT_SLACK_ALL_REQUESTED
         */
        static get EVENT_SLACK_ALL_REQUESTED() {
            return 'slackAllRequested';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_TOP_REQUESTED
         */
        static get EVENT_SLACK_TOP_REQUESTED() {
            return 'slackTopRequested';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_SEED_REQUESTED
         */
        static get EVENT_SLACK_SEED_REQUESTED() {
            return 'slackSeedRequested';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_STAT_REQUESTED
         */
        static get EVENT_SLACK_STAT_REQUESTED() {
            return 'slackStatRequested';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_BALANCE_REQUESTED
         */
        static get EVENT_SLACK_BALANCE_REQUESTED() {
            return 'slackBalanceRequested';
        }

        /**
         * @static
         * @const {string} EVENT_SLACK_ADDRESS_REQUESTED
         */
        static get EVENT_SLACK_ADDRESS_REQUESTED() {
            return 'slackAddressRequested';
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
         * @const {string} EVENT_STORAGE_NO_WALLET
         */
        static get EVENT_STORAGE_NO_WALLET() {
            return 'storageNoWalletFound';
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
         * @static
         * @const {string} EVENT_STORAGE_SEED_REQUEST_FAILED
         */
        static get EVENT_STORAGE_SEED_REQUEST_FAILED() {
            return 'storageSeedRequestFailed';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_SEED_REQUEST_SUCCEEDED
         */
        static get EVENT_STORAGE_SEED_REQUEST_SUCCEEDED() {
            return 'storageSeedRequestSucceeded';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_ADDRESS_REQUEST_FAILED
         */
        static get EVENT_STORAGE_ADDRESS_REQUEST_FAILED() {
            return 'storageAddressRequestFailed';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED
         */
        static get EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED() {
            return 'storageAddressRequestSucceeded';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_REQUEST_BALANCE
         */
        static get EVENT_STORAGE_REQUEST_BALANCE() {
            return 'storageBalanceRequested';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_STAT_REQUEST_FAILED
         */
        static get EVENT_STORAGE_STAT_REQUEST_FAILED() {
            return 'storageBalanceRequestFailed';
        }

        /**
         * @static
         * @const {string} EVENT_STORAGE_STAT_REQUEST_SUCCEEDED
         */
        static get EVENT_STORAGE_STAT_REQUEST_SUCCEEDED() {
            return 'storageBalanceRequestSucceeded';
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

            Emitter.emit(type, {type, data});
        }

        /**
         * @static
         * @method sub
         *
         * @param {string} type
         * @param {Function} handler
         */
        static sub(type, handler) {
            Emitter.on(type, handler);
        }

    }

    // Class export
    return Self;

}).call(WavesSlackRewardBot);



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
         * @constructor
         *
         * @fires Super.Event.EVENT_NODE_CONNECTED
         * @fires Super.Event.EVENT_NODE_NOT_CONNECTED
         */
        constructor() {
            // Bind some methods to the current context
            this._route = this._route.bind(this);

            // Add event handlers
            this._live();

            // Initiate
            try {
                this._module = WavesAPI.create(WavesAPI[CONF.WAVES_API.CONFIG_ALIAS]);
                Super.Event.pub(Super.Event.EVENT_NODE_CONNECTED);
            } catch (exc) {
                Super.Event.pub(Super.Event.EVENT_NODE_NOT_CONNECTED);
                Super.error(exc);
            }
        }

        /**
         * @private
         * @method _live
         */
        _live() {
            // Modules events
            Super.Event.sub(Super.Event.EVENT_STORAGE_TRANSFER_WAVES, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_REQUEST_BALANCE, this._route);
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
                case Super.Event.EVENT_STORAGE_TRANSFER_WAVES:
                    this._transferWaves(event.data);
                    break;

                // 
                case Super.Event.EVENT_STORAGE_REQUEST_BALANCE:
                    this._checkBalance(event.data);
                    break;

            }
        }

        /**
         * @private
         * @method _transferWaves
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_NODE_REQUEST_REJECTED
         * @fires Super.Event.EVENT_NODE_REQUEST_ABORTED
         * @fires Super.Event.EVENT_NODE_REQUEST_SUCCEEDED
         */
        _checkBalance(data) {
            var
                url = CONF.WAVES_API.BALANCE_URL.
                      replace('${address}', data.emitent.address).
                      replace('${assetId}', CONF.WAVES_API.ASSET_ID);

            // Send balance request to Waves api
            Restler.get(url).
            on('fail', (res, xhr) => {
                data.ok = false;
                data.answer = res;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_REJECTED, data)
            }).
            on('error', (exc, xhr) => {
                data.ok = false;
                data.answer = exc;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_ABORTED, data);
            }).
            on('timeout', (res, xhr) => {
                data.ok = false;
                data.answer = res;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_ABORTED, data);
            }).
            on('success', (res, xhr) => {
                data.balance.count = res.balance;
                data.balance.asset = res.assetId;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_SUCCEEDED, data);
            });
        }

        /**
         * @private
         * @method _transferWaves
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_NODE_REQUEST_REJECTED
         * @fires Super.Event.EVENT_NODE_REQUEST_REJECTED
         * @fires Super.Event.EVENT_NODE_REQUEST_REJECTED
         */
        _transferWaves(data) {
            var
                params = {
                             fee : CONF.WAVES_API.FEE_AMOUNT,
                             alias : 'SlackBotTransfer',
                             amount : data.transfer.amount,
                             recipient : data.recipient.address,
                             assetId : CONF.WAVES_API.ASSET_ID,
                             feeAssetId : CONF.WAVES_API.ASSET_ID
                         },
                request = null;

            // Create request JSON object
            request = transfer(data.emitent.phrase, params);

            // Send ready and signed request to Waves api
            Restler.postJson(CONF.WAVES_API.TRANSACTION_URL, request).
            on('fail', (res, xhr) => {
                data.ok = false;
                data.answer = res.message;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_REJECTED, data);
            }).
            on('error', (exc, xhr) => {
                data.ok = false;
                data.answer = exc;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_ABORTED, data);
            }).
            on('timeout', (res, xhr) => {
                data.ok = false;
                data.answer = res.message;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_ABORTED, data);
            }).
            on('success', (res, xhr) => {
                data.ok = true;
                data.transfer.id = res.id;
                Super.Event.pub(Super.Event.EVENT_NODE_REQUEST_SUCCEEDED, data);
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
         * @const {Array} CMD_PING
         */
        static get CMD_PING() {
            return 'ping';
        }

        /**
         * @static
         * @const {Array} CMD_HELP
         */
        static get CMD_HELP() {
            return 'help';
        }

        /**
         * @static
         * @const {Array} CMD_GET_SEED
         */
        static get CMD_GET_SEED() {
            return 'seed';
        }

        /**
         * @static
         * @const {Array} CMD_GET_STAT
         */
        static get CMD_GET_STAT() {
            return 'stat';
        }

        /**
         * @static
         * @const {Array} CMD_GET_ADDRESS
         */
        static get CMD_GET_ADDRESS() {
            return 'address';
        }

        /**
         * @static
         * @const {Array} CMD_GET_BALANCE
         */
        static get CMD_GET_BALANCE() {
            return 'balance';
        }

        /**
         * @static
         * @const {Array} CMD_LIST
         */
        static get CMD_LIST() {
            return [
                Self.CMD_PING,
                Self.CMD_HELP,
                Self.CMD_GET_SEED,
                Self.CMD_GET_STAT,
                Self.CMD_GET_ADDRESS,
                Self.CMD_GET_BALANCE
            ];
        }

        /**
         * @static
         * @const {Array} CMD_FULL_LIST
         */
        static get CMD_FULL_LIST() {
            var
                list = Self.CMD_LIST.slice();

            list.push('stat month');
            list.push('stat balances');

            list.sort();

            return list;
        }

        /**
         * @static
         * @const {Array} WAVES_ALIASES
         */
        static get WAVES_ALIASES() {
            return [
                'ThanksCoin',
                'ThanksCoins',
                'Thankscoins',
                'thanksCoins',
                'thankscoins',
                'thank',
                'thanks',
                'thank you',
                'thave',
                'thaves',
                'coin',
                'coins',
                'token',
                'tokens',
                'монет',
                'монета',
                'монету',
                'монеты',
                'монетка',
                'монетки',
                'монетку',
                'монеток',
                'токен',
                'токена',
                'токенов',
                'благодарность',
                'благодарности',
                'благодарностей',
                'спасиб',
                'спасиба',
                'спасибо',
                'спасибу',
                'спасибы',
                'спасибов',
                'спасибищ',
                'спасибища',
                'спасибище'
            ];
        }

        /**
         * @static
         * @const {Array} REWARDED_REACTIONS
         */
        static get REWARDED_REACTIONS() {
            return [
                'waves_new_logo',
                'dolphin',
                'billy',
                'billy2'
            ];
        }

        /**
         * @static
         * @const {string} REGEXP_USER
         */
        static get REGEXP_USER() {
            return '<@([^>]+)>';
        }

        /**
         * @static
         * @const {string} REGEXP_INSTANT_MESSAGE
         */
        static get REGEXP_INSTANT_MESSAGE() {
            return '(\\d+)[\\s\\S]+(' +
                   Self.WAVES_ALIASES.join('|') +
                   ')[\\s\\S]+<@([^>]+)>[\\s\\S]*';
        }

        /**
         * @static
         * @const {string} ANSWER_PONG
         */
        static get ANSWER_PONG() {
            return 'Wut?';
        }

        /**
         * @static
         * @const {string} ANSWER_HELP
         */
        static get ANSWER_HELP() {
            return 'Available commands:\n\n— ' + Self.CMD_FULL_LIST.join(',\n— ');
        }

        /**
         * @static
         * @const {string} ANSWER_NODE_REQUEST_ABORTED
         */
        static get ANSWER_NODE_REQUEST_ABORTED() {
            return '' +
                'Oops! Seems like some serious internal error has been happened while' +
                'transaction process.\n Try to make it later.';
        }

        /**
         * @static
         * @const {string} ANSWER_NODE_REQUEST_REJECTED
         */
        static get ANSWER_NODE_REQUEST_REJECTED() {
            return 'Your request rejected.';
        }

        /**
         * @static
         * @const {string} ANSWER_TRANSFER_COMPLETED
         */
        static get ANSWER_TRANSFER_COMPLETED() {
            return 'Your request completed. (*<${link}|${hash}>*)';
        }

        /**
         * @static
         * @const {string} ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT
         */
        static get ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT() {
            return 'User ${user} transfered you <${link}|${amount} ${pluralized}>';
        }

        /**
         * @static
         * @const {string} ANSWER_THANK_YOU
         */
        static get ANSWER_THANK_YOU() {
            return 'Will try to do immediately. Thanks for your generosity.';
        }

        /**
         * @static
         * @const {string} ANSWER_NOT_TO_MYSELF
         */
        static get ANSWER_NOT_TO_MYSELF() {
            return 'I cannot afford it. I\'m at the service.';
        }

        /**
         * @static
         * @const {string} ANSWER_NOT_TO_YOURSELF
         */
        static get ANSWER_NOT_TO_YOURSELF() {
            return 'You\'re trying to transfer to yourself.';
        }

        /**
         * @static
         * @const {string} ANSWER_INCORRECT_SYNTAX
         */
        static get ANSWER_INCORRECT_SYNTAX() {
            return 'Incorrect syntax. You should write for example: *10 ThanksCoins @user_nick*';
        }

        /**
         * @static
         * @const {string} ANSWER_ALL_COUNTED
         */
        static get ANSWER_ALL_COUNTED() {
            return 'Top stat:\n\n';
        }

        /**
         * @static
         * @const {string} ANSWER_TOP_COUNTED
         */
        static get ANSWER_TOP_COUNTED() {
            return 'Top stat for month:\n\n';
        }

        /**
         * @static
         * @const {string} ANSWER_TOP_COUNTED_NOTHING
         */
        static get ANSWER_TOP_COUNTED_NOTHING() {
            return 'No transactions yet.';
        }

        /**
         * @static
         * @const {string} ANSWER_YOUR_SEED_IS
         */
        static get ANSWER_YOUR_SEED_IS() {
            return 'Your wallet seed is *${seed}*';
        }

        /**
         * @static
         * @const {string} ANSWER_YOUR_SEED_IS_UNKNOWN
         */
        static get ANSWER_YOUR_SEED_IS_UNKNOWN() {
            return Self.ANSWER_YOUR_SEED_IS.
                   replace('${seed}', 'unknown');
        }

        /**
         * @static
         * @const {string} ANSWER_YOUR_ADDRESS_IS
         */
        static get ANSWER_YOUR_ADDRESS_IS() {
            return 'Your wallet address is *${address}*';
        }

        /**
         * @static
         * @const {string} ANSWER_YOUR_ADDRESS_IS_UNKNOWN
         */
        static get ANSWER_YOUR_ADDRESS_IS_UNKNOWN() {
            return Self.ANSWER_YOUR_ADDRESS_IS.
                   replace('${address}', 'unknown');
        }

        /**
         * @static
         * @const {string} ANSWER_USER_BALANCE_IS
         */
        static get ANSWER_USER_BALANCE_IS() {
            return '${user} wallet balance is *${count}* ${pluralized}';
        }

        /**
         * @static
         * @const {string} ANSWER_YOUR_BALANCE_IS
         */
        static get ANSWER_YOUR_BALANCE_IS() {
            return Self.ANSWER_USER_BALANCE_IS.
                   replace('${user}', 'Your')
        }

        /**
         * @static
         * @const {string} ANSWER_BALANCE_ISNT_COUNTED
         */
        static get ANSWER_BALANCE_ISNT_COUNTED() {
            return 'Wasn\'t able to count balance';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_FAILED
         */
        static get ANSWER_STAT_REQUEST_FAILED() {
            return 'Cannot compute';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_SUCCEEDED
         */
        static get ANSWER_STAT_REQUEST_SUCCEEDED() {
            return 'Statistics for ${head}:\n${body}';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_ITEM
         */
        static get ANSWER_STAT_REQUEST_ITEM() {
            return '\n${user} *${thaves}*';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_BREAK
         */
        static get ANSWER_STAT_REQUEST_BREAK() {
            return '\n…';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_HEAD_FOR_MONTH
         */
        static get ANSWER_STAT_REQUEST_HEAD_FOR_MONTH() {
            return 'month';
        }

        /**
         * @static
         * @const {string} ANSWER_STAT_REQUEST_HEAD_FOR_BALANCES
         */
        static get ANSWER_STAT_REQUEST_HEAD_FOR_BALANCES() {
            return 'balances';
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
         * @fires Super.Event.EVENT_SLACK_NOT_CONNECTED
         * @fires Super.Event.EVENT_SLACK_CONNECTED
         */
        constructor() {
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
                Super.Event.pub(Super.Event.EVENT_SLACK_NOT_CONNECTED);
                return;
            }

            // Everything's ok
            Super.Event.pub(Super.Event.EVENT_SLACK_CONNECTED);
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
            Super.Event.sub(Super.Event.EVENT_NODE_REQUEST_ABORTED, this._route);
            Super.Event.sub(Super.Event.EVENT_NODE_REQUEST_REJECTED, this._route);
            Super.Event.sub(Super.Event.EVENT_NODE_REQUEST_SUCCEEDED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_TRANSFER_COMPLETED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_SEED_REQUEST_FAILED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_STAT_REQUEST_FAILED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_FAILED, this._route);
            Super.Event.sub(Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED, this._route);
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
                case Super.Event.EVENT_NODE_REQUEST_ABORTED:
                    this._answerDefaultNodeRequestAbort(event.data);
                    break;

                // Answer with default Node request reject
                case Super.Event.EVENT_NODE_REQUEST_REJECTED:
                    this._answerDefaultNodeRequestReject(event.data);
                    break;

                // Answer with default Node request success
                case Super.Event.EVENT_NODE_REQUEST_SUCCEEDED:
                    if (event.data.balance) {
                        this._answerMyBalance(event.data);
                    }
                    break;

                // Answer that transfer was completed
                case Super.Event.EVENT_STORAGE_TRANSFER_COMPLETED:
                    this._answerTransferCompleted(event.data)
                    break;

                // Answer that my wallet seed request failed
                case Super.Event.EVENT_STORAGE_SEED_REQUEST_FAILED:
                    this._answer(event.data.channel.id, Self.ANSWER_YOUR_SEED_IS_UNKNOWN);
                    break;

                // Answer that my wallet seed request succeeded
                case Super.Event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED:
                    this._answerMySeed(event.data);
                    break;

                // Answer that my wallet address request failed
                case Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_FAILED:
                    this._answer(event.data.channel.id, Self.ANSWER_ADDRESS_REQUEST_FAILED);
                    break;

                // Answer that my wallet address request succeeded
                case Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED:
                    this._answerMyAddress(event.data);
                    break;

                // Answer that stat request failed
                case Super.Event.EVENT_STORAGE_STAT_REQUEST_FAILED:
                    this._answer(event.data.channel.id, Self.ANSWER_STAT_REQUEST_FAILED);
                    break;

                // Answer that stat request succeeded
                case Super.Event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED:
                    this._answerStat(event.data)
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
                    if (await this._isIM(event.channel).catch(Super.error)) {
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
                im = await this._isIM(channel).catch(Super.error);

            // 
            if (!im || forceIM) {
                channel = `@${uid}`;
            }

            await this._web.chat.postMessage({channel, text}).
            catch(Super.error);
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
                Self.ANSWER_NODE_REQUEST_ABORTED,
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
                    Self.ANSWER_NODE_REQUEST_REJECTED +
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
                text = Self.ANSWER_TRANSFER_COMPLETED.
                       replace('${link}', link).
                       replace('${hash}', data.transfer.id);

            // Tell emitent that transfer succeeded
            this._answer(data.channel.id, text, data.emitent.id);

            // Tell recipient that transfer happened
            setTimeout(() => {
                text = Self.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT.
                       replace('${user}', Self._getTaggedUser(data.emitent.id)).
                       replace('${link}', link).
                       replace('${amount}', data.transfer.amount).
                       replace('${pluralized}', Super.pluralize(
                           data.transfer.amount,
                           CONF.CURRENCY.ONE,
                           CONF.CURRENCY.TWO,
                           CONF.CURRENCY.ALL
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
                text = Self.ANSWER_YOUR_SEED_IS.
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
                text = Self.ANSWER_YOUR_ADDRESS_IS.
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
                this._answer(data.channel.id, Self.ANSWER_BALANCE_ISNT_COUNTED);
                return;
            }

            var
                text = '';

            // Choose text for message
            if (data.recipient && data.recipient.id) {
                text = Self.ANSWER_USER_BALANCE_IS.
                       replace('${user}', Self._getTaggedUser(data.recipient.id));
            } else {
                text = Self.ANSWER_YOUR_BALANCE_IS;
            }

            // Fill other placeholders
            text = text.
                   replace('${count}', data.balance.count).
                   replace('${pluralized}', Super.pluralize(
                       data.balance.count,
                       CONF.CURRENCY.ONE,
                       CONF.CURRENCY.TWO,
                       CONF.CURRENCY.ALL
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
                            data.stat.alias :
                            Self.ANSWER_STAT_REQUEST_HEAD_FOR_MONTH
                        ).toUpperCase(),
                buffer = '',
                list = data.stat.list,
                item = null;

            // Compile answer message
            while (++it0 < list.length) {
                item = list[it0];

                buffer += Self.ANSWER_STAT_REQUEST_ITEM.
                          replace('${user}', Self._getTaggedUser(item[0])).
                          replace('${thaves}', item[1]);

                // Slack message limit
                if (buffer.length >= symbols) {
                    buffer += Self.ANSWER_STAT_REQUEST_BREAK;
                    break;
                }
            }

            alias = 'ANSWER_STAT_REQUEST_HEAD_FOR_' + alias;
            buffer = Self.ANSWER_STAT_REQUEST_SUCCEEDED.
                     replace('${head}', Self[alias]).
                     replace('${body}', buffer);

            // Send
            this._answer(data.channel.id, buffer);
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
         * @method _parseCommandMessage
         *
         * @param {number} off
         * @param {Event} event
         */
        _parseCommandMessage(offset, event) {
            switch (Self.CMD_LIST[offset]) {

                // 
                case Self.CMD_PING:
                    this._answer(event.channel, Self.ANSWER_PONG, event.user);
                    break;

                // 
                case Self.CMD_HELP:
                    this._answer(event.channel, Self.ANSWER_HELP, event.user);
                    break;

                // 
                case Self.CMD_GET_ALL:
                    Super.Event.pub(Super.Event.EVENT_SLACK_ALL_REQUESTED, {
                        channel : {id : event.channel},
                        emitent : {id : event.user},
                        all : {}
                    });
                    break;

                // 
                case Self.CMD_GET_TOP:
                    Super.Event.pub(Super.Event.EVENT_SLACK_TOP_REQUESTED, {
                        channel : {id : event.channel},
                        emitent : {id : event.user},
                        top : {}
                    });
                    break;

                // 
                case Self.CMD_GET_SEED:
                    Super.Event.pub(Super.Event.EVENT_SLACK_SEED_REQUESTED, {
                        channel : {id : event.channel},
                        emitent : {id : event.user}
                    });
                    break;

                //
                case Self.CMD_GET_STAT:
                    Super.Event.pub(Super.Event.EVENT_SLACK_STAT_REQUESTED, {
                        channel : {id : event.channel},
                        emitent : {id : event.user},
                        stat : {alias : event.text.split(/\s+/)[1]}
                    });
                    break;

                // 
                case Self.CMD_GET_ADDRESS:
                    Super.Event.pub(Super.Event.EVENT_SLACK_ADDRESS_REQUESTED, {
                        channel : {id : event.channel},
                        emitent : {id : event.user}
                    });
                    break;

                // 
                case Self.CMD_GET_BALANCE:
                    this._parseCommandGetBalance(event);
                    break;

            }
        }

        _parseCommandGetBalance(event) {
            var
                recipient = event.text.match(new RegExp(Self.REGEXP_USER, 'g')),
                data = {
                            channel : {id : event.channel},
                            emitent : {id : event.user},
                            balance : {}
                       };

            // No need to go further
            if (recipient && recipient.length) {
                data.recipient = {id : recipient[0].replace(/[<>@]/g, '')};
            }

            Super.Event.pub(Super.Event.EVENT_SLACK_BALANCE_REQUESTED, data);
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
                rexp = new RegExp(Self._getTaggedUser(this._me) + '\\s+' + Self.REGEXP_INSTANT_MESSAGE, 'g'),
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
                rexp = new RegExp('^' + Self.REGEXP_INSTANT_MESSAGE, 'g'),
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
         * @method _finishParsing
         *
         * @param {string} channel
         * @param {boolean} im
         * @param {string} emitent
         * @param {number} recipient
         * @param {string} amount
         * @param {boolean} answer
         *
         * @fires Super.Event.EVENT_SLACK_WAVES_GRANTED
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
            Super.Event.pub(Super.Event.EVENT_SLACK_WAVES_GRANTED, {
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
         * @const {string} SQL_GET_WALLET_ID
         */
        static get SQL_GET_WALLET_ID() {
            return `
                SELECT
                    slack_id,
                    wallet_phrase,
                    wallet_address
                FROM
                    ${CONF.DB.WALLETS_TABLE_NAME}
                WHERE
                    slack_id = $1
                LIMIT
                    1
            `;
        }

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
         * @const {string} SQL_GET_ALL_RECIPIENTS
         */
        static get SQL_GET_ALL_RECIPIENTS() {
            return `
                SELECT
                    recipient_id,
                    sum(transaction_amount) AS transaction_amount,
                    max(transaction_date) AS transaction_date
                FROM
                    ${CONF.DB.TRANSACTIONS_TABLE_NAME}
                GROUP BY
                    recipient_id
                ORDER BY
                    transaction_amount DESC,
                    transaction_date DESC
            `;
        }

        /**
         * @static
         * @const {string} SQL_GET_TOP_RECIPIENTS
         */
        static get SQL_GET_TOP_RECIPIENTS() {
            return `
                SELECT
                    recipient_id,
                    sum(transaction_amount) AS transaction_amount,
                    max(transaction_date) AS transaction_date
                FROM
                    ${CONF.DB.TRANSACTIONS_TABLE_NAME}
                WHERE
                    transaction_date >= $1
                GROUP BY
                    recipient_id
                ORDER BY
                    transaction_amount DESC,
                    transaction_date DESC
            `;
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
            Super.Event.sub(Super.Event.EVENT_SLACK_WAVES_GRANTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_ALL_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_TOP_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_SEED_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_STAT_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_ADDRESS_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_SLACK_BALANCE_REQUESTED, this._route);
            Super.Event.sub(Super.Event.EVENT_NODE_REQUEST_SUCCEEDED, this._route);
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

                // Check if wallets exist and send transaction request
                case Super.Event.EVENT_SLACK_WAVES_GRANTED:
                    this._checkWallets(event.data);
                    break;

                //
                case Super.Event.EVENT_SLACK_ALL_REQUESTED:
                    this._getStatAll(event.data);
                    break;

                //
                case Super.Event.EVENT_SLACK_TOP_REQUESTED:
                    this._getStatTop(event.data);
                    break;

                // 
                case Super.Event.EVENT_SLACK_SEED_REQUESTED:
                    this._getMySeed(event.data);
                    break;

                //
                case Super.Event.EVENT_SLACK_STAT_REQUESTED:
                    this._getStat(event.data);
                    break;

                // 
                case Super.Event.EVENT_SLACK_ADDRESS_REQUESTED:
                    this._getMyAddress(event.data);
                    break;

                // Check if wallet exist and send balance request
                case Super.Event.EVENT_SLACK_BALANCE_REQUESTED:
                    this._getMyBalance(event.data);
                    break;

                // Save transaction info
                case Super.Event.EVENT_NODE_REQUEST_SUCCEEDED:
                    if (event.data.transfer) {
                        this._addTransaction(event.data);
                    }
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
         * @fires Super.Event.EVENT_STORAGE_CONNECTED
         * @fires Super.Event.EVENT_STORAGE_NOT_CONNECTED
         */
        async _connect() {
            await this._client.connect(
                () => {Super.Event.pub(Super.Event.EVENT_STORAGE_CONNECTED)},
                (exc) => {Super.Event.pub(Super.Event.EVENT_STORAGE_NOT_CONNECTED, exc)}
            );
        }

        /**
         * @async
         * @private
         * @method _getStatTop
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_STAT_REQUEST_FAILED
         * @fires Super.Event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED
         */
        async _getStat(data) {
            var
                list = null;

            switch (data.stat.alias) {

                // Total balances
                case 'balances':
                    list = await this._getStatBalances(data);
                    break;

                // Montly banalce
                default:
                    data.alias = 'month';
                    list = await this._getStatMonth(data);
                    break;
            }

            // No need to go further
            if (!list) {
                Super.Event.pub(Super.Event.EVENT_STORAGE_STAT_REQUEST_FAILED, data);
                return;
            }

            data.stat.list = list;

            Super.Event.pub(Super.Event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED, data);
        }

        /**
         * @async
         * @private
         * @method _getStatMonth
         *
         * @param {object} data
         *
         * @returns {object}
         */
        async _getStatMonth(data) {
            var
                date = new Date(),
                stat = null;

            // Move date to the very beginning of current month
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);

            // Make request
            stat = await this._request(
                       Self.SQL_GET_TOP_RECIPIENTS,
                       [date],
                       'array'
                   ).catch(Super.error);

            // No need to go further
            if (!stat || !stat.rowCount) {
                return null;
            }

            return stat.rows;
        }

        /**
         * @async
         * @private
         * @method _getStatBalances
         *
         * @param {object} data
         *
         * @returns {object}
         */
        async _getStatBalances(data) {
            var
                // Make request
                stat = await this._request(
                           Self.SQL_GET_ALL_RECIPIENTS,
                           [],
                           'array'
                       ).catch(Super.error);

            // No need to go further
            if (!stat || !stat.rowCount) {
                return null;
            }

            return stat.rows;
        }

        /**
         * @async
         * @private
         * @method _getStatAddress
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_SEED_REQUEST_FAILED
         * @fires Super.Event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED
         */
        async _getMySeed(data) {
            var
                wallet = await this._checkWallet(data);

            // No need to go further
            if (!wallet) {
                Super.Event.pub(Super.Event.EVENT_STORAGE_SEED_REQUEST_FAILED, data);
                return;
            }

            // Set emitent address
            data.emitent.seed = wallet[1];

            //
            Super.Event.pub(Super.Event.EVENT_STORAGE_SEED_REQUEST_SUCCEEDED, data);
        }

        /**
         * @async
         * @private
         * @method _getStatAddress
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED
         */
        async _getMyAddress(data) {
            var
                wallet = await this._checkWallet(data);

            // No need to go further
            if (!wallet) {
                Super.Event.pub(Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_FAILED, data);
                return;
            }

            // Set emitent address
            data.emitent.address = wallet[2];

            //
            Super.Event.pub(Super.Event.EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED, data);
        }

        /**
         * @async
         * @private
         * @method _getStatBalance
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_REQUEST_BALANCE
         */
        async _getMyBalance(data) {
            var
                wallet = await this._checkWallet(data);

            // No need to go further
            if (!wallet) {
                return;
            }

            // Set emitent address
            data.emitent.address = wallet[2];

            // 
            Super.Event.pub(Super.Event.EVENT_STORAGE_REQUEST_BALANCE, data);
        }


        /**
         * @async
         * @private
         * @method _checkWallets
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_NO_WALLET
         *
         * @returns {object}
         */
        async _checkWallet(data) {
            var
                id = (data.recipient ? data.recipient.id : data.emitent.id),
                wallet = await this._request(
                              Self.SQL_GET_WALLET_ID,
                              [id],
                              'array'
                          ).catch(Super.error);

            // No need to go further
            if (!wallet || !wallet.rowCount) {
                Super.Event.pub(Super.Event.EVENT_STORAGE_NO_WALLET, data);
                return null;
            }

            return wallet.rows[0];
        }

        /**
         * @async
         * @private
         * @method _checkWallets
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_NO_WALLETS
         * @fires Super.Event.EVENT_STORAGE_NO_EMITTER_WALLET
         * @fires Super.Event.EVENT_STORAGE_NO_RECIPIENT_WALLET
         * @fires Super.Event.EVENT_STORAGE_TRANSFER_WAVES
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
                Super.Event.pub(Super.Event.EVENT_STORAGE_NO_WALLETS, data);
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
                Super.Event.pub(Super.Event.EVENT_STORAGE_NO_EMITTER_WALLET, data);
                return;
            } else if (!data.recipient.address) {
                Super.Event.pub(Super.Event.EVENT_STORAGE_NO_RECIPIENT_WALLET, data);
                return;
            }

            Super.Event.pub(Super.Event.EVENT_STORAGE_TRANSFER_WAVES, data);
        }

        /**
         * @async
         * @private
         * @method _addTransaction
         *
         * @param {object} data
         *
         * @fires Super.Event.EVENT_STORAGE_TRANSFER_NOT_COMPLETED
         * @fires Super.Event.EVENT_STORAGE_TRANSFER_COMPLETED
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
                Super.Event.pub(Super.Event.EVENT_STORAGE_TRANSFER_NOT_COMPLETED, data);
                return;
            }

            Super.Event.pub(Super.Event.EVENT_STORAGE_TRANSFER_COMPLETED, data);
        }

    }

    // Class export
    return Self;

}).call(WavesSlackRewardBot);



// Export module
module.exports = WavesSlackRewardBot;
