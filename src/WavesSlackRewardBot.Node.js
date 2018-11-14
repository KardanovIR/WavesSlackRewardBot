/**
 * @class Node
 * @memberof WavesSlackRewardBot
 *
 * @see https://github.com/wavesplatform/waves-api
 * @see https://www.npmjs.com/package/waves-transactions
 * @see https://github.com/danwrong/restler
 */

/**
 * @const {object} CONF
 */
const CONF = require('../conf.json');

/**
 * @const {restler} Restler
 *
 * @see https://github.com/danwrong/restler
 */
const Restler = require('restler');

/**
 * @const {@waves/waves-api} WavesAPI
 *
 * @see https://github.com/wavesplatform/waves-api
 */
const WavesAPI = require('@waves/waves-api');

/**
 * @const {waves-transactions} transfer
 *
 * @see https://www.npmjs.com/package/waves-transactions
 */
const {transfer} = require('waves-transactions');

/**
 * @class WavesSlackRewardBot.Node
 */
class Self {

    /**
     * @constructor
     *
     * @param {object} args
     *
     * @fires this._event.EVENT_NODE_CONNECTED
     * @fires this._event.EVENT_NODE_NOT_CONNECTED
     */
    constructor(args) {
        // Set error handler
        this._error = args.error;

        // Set link to global event emitter
        this._event = args.event;

        // Bind some methods to the current context
        this._route = this._route.bind(this);

        // Add event handlers
        this._live();

        // Initiate
        try {
            this._module = WavesAPI.create(WavesAPI[CONF.WAVES_API.CONFIG_ALIAS]);
            this._event.pub(this._event.EVENT_NODE_CONNECTED);
        } catch (exc) {
            this._event.pub(this._event.EVENT_NODE_NOT_CONNECTED);
            this._error(exc);
        }
    }

    /**
     * @private
     * @method _live
     */
    _live() {
        // Modules events
        this._event.sub(this._event.EVENT_STORAGE_TRANSFER_WAVES, this._route);
        this._event.sub(this._event.EVENT_STORAGE_REQUEST_BALANCE, this._route);
        this._event.sub(this._event.EVENT_STORAGE_CREATE_NEW_WALLETS, this._route);
        this._event.sub(this._event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED, this._route);
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
            case this._event.EVENT_STORAGE_TRANSFER_WAVES:
                this._transferWaves(event.data);
                break;

            // 
            case this._event.EVENT_STORAGE_REQUEST_BALANCE:
                this._checkBalance(event.data);
                break;

            // 
            case this._event.EVENT_STORAGE_CREATE_NEW_WALLETS:
                this._createNewWallets(event.data);
                break;

            //
            case this._event.EVENT_STORAGE_STAT_REQUEST_SUCCEEDED:
                this._checkBalances(event.data);
                break;

        }
    }

    /**
     * @private
     * @method _createNewWallets
     *
     * @param {object} data
     */
    _createNewWallets(data) {
        var
            seed = null;

        // Get seed for each
        data.update.users = data.update.users.map((uid) => {
            seed = this._module.Seed.create();

            return {
                slack_id : uid,
                wallet_phrase : seed.phrase,
                wallet_address : seed.address
            }
        });

        // 
        this._event.pub(this._event.EVENT_NODE_WALLETS_CREATED, data);
    }

    /**
     * @private
     * @method _checkBalances
     *
     * @param {object} data
     *
     * @fires this._event.EVENT_NODE_REQUEST_REJECTED
     * @fires this._event.EVENT_NODE_REQUEST_ABORTED
     * @fires this._event.EVENT_NODE_REQUEST_SUCCEEDED
     */
    _checkBalances(data) {
        var
            url = CONF.WAVES_API.BALANCES_URL.
                  replace('${assetId}', CONF.WAVES_API.ASSET_ID);

        // Send balance request to Waves api
        Restler.get(url).
        on('fail', (res, xhr) => {
            data.ok = false;
            data.answer = res;
            this._event.pub(this._event.EVENT_NODE_REQUEST_REJECTED, data)
        }).
        on('error', (exc, xhr) => {
            data.ok = false;
            data.answer = exc;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('timeout', (res, xhr) => {
            data.ok = false;
            data.answer = res;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('success', (res, xhr) => {
            if (data.stat.alias == 'balances') {
                // Correct data array
                data.stat.list = data.stat.list.map((row) => {
                    row.transaction_amount = res[row.wallet_address];
                    row.transaction_amount = row.transaction_amount ?
                                             row.transaction_amount :
                                             0;
                    return row;
                });

                // Resort array due to amounts from Nodes
                data.stat.list.sort((a, b) => {
                    if (a.transaction_amount < b.transaction_amount) {
                        return 1;
                    } else if (a.transaction_amount > b.transaction_amount) {
                        return -1;
                    }

                    return 0;
                })
            }

            this._event.pub(this._event.EVENT_NODE_REQUEST_SUCCEEDED, data);
        });
    }

    /**
     * @private
     * @method _checkBalance
     *
     * @param {object} data
     *
     * @fires this._event.EVENT_NODE_REQUEST_REJECTED
     * @fires this._event.EVENT_NODE_REQUEST_ABORTED
     * @fires this._event.EVENT_NODE_REQUEST_SUCCEEDED
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
            this._event.pub(this._event.EVENT_NODE_REQUEST_REJECTED, data)
        }).
        on('error', (exc, xhr) => {
            data.ok = false;
            data.answer = exc;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('timeout', (res, xhr) => {
            data.ok = false;
            data.answer = res;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('success', (res, xhr) => {
            data.balance.count = res.balance;
            data.balance.asset = res.assetId;
            this._event.pub(this._event.EVENT_NODE_REQUEST_SUCCEEDED, data);
        });
    }

    /**
     * @private
     * @method _transferWaves
     *
     * @param {object} data
     *
     * @fires this._event.EVENT_NODE_REQUEST_REJECTED
     * @fires this._event.EVENT_NODE_REQUEST_REJECTED
     * @fires this._event.EVENT_NODE_REQUEST_REJECTED
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
            this._event.pub(this._event.EVENT_NODE_REQUEST_REJECTED, data);
        }).
        on('error', (exc, xhr) => {
            data.ok = false;
            data.answer = exc;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('timeout', (res, xhr) => {
            data.ok = false;
            data.answer = res.message;
            this._event.pub(this._event.EVENT_NODE_REQUEST_ABORTED, data);
        }).
        on('success', (res, xhr) => {
            data.ok = true;
            data.transfer.id = res.id;
            this._event.pub(this._event.EVENT_NODE_REQUEST_SUCCEEDED, data);
        });
    }
}

/**
 * @exports WavesSlackRewardBot.Node
 */
module.exports = Self;
