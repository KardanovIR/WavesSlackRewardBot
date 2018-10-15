/**
 * @const {EventEmitter} EventEmitter
 *
 * @see https://nodejs.org/api/events.html
 */
const {EventEmitter} = require('events');

/**
 * @class WavesSlackRewardBot.Event
 */
class Self {

    /**
     * @static
     * @const {string} EVENT_NODE_CONNECTED
     */
    get EVENT_NODE_CONNECTED() {
        return 'nodeConnected';
    }

    /**
     * @static
     * @const {string} EVENT_NODE_NOT_CONNECTED
     */
    get EVENT_NODE_NOT_CONNECTED() {
        return 'nodeNotConnected';
    }

    /**
     * @static
     * @const {string} EVENT_NODE_REQUEST_ABORTED
     */
    get EVENT_NODE_REQUEST_ABORTED() {
        return 'nodeRequestAborted';
    }

    /**
     * @static
     * @const {string} EVENT_NODE_REQUEST_REJECTED
     */
    get EVENT_NODE_REQUEST_REJECTED() {
        return 'nodeRequestRejected';
    }

    /**
     * @static
     * @const {string} EVENT_NODE_REQUEST_SUCCEEDED
     */
    get EVENT_NODE_REQUEST_SUCCEEDED() {
        return 'nodeRequestSucceeded';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_CONNECTED
     */
    get EVENT_SLACK_CONNECTED() {
        return 'slackConnected';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_NOT_CONNECTED
     */
    get EVENT_SLACK_NOT_CONNECTED() {
        return 'slackNotConnected';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_WAVES_GRANTED
     */
    get EVENT_SLACK_WAVES_GRANTED() {
        return 'slackWavesGranted';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_ALL_REQUESTED
     */
    get EVENT_SLACK_ALL_REQUESTED() {
        return 'slackAllRequested';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_TOP_REQUESTED
     */
    get EVENT_SLACK_TOP_REQUESTED() {
        return 'slackTopRequested';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_SEED_REQUESTED
     */
    get EVENT_SLACK_SEED_REQUESTED() {
        return 'slackSeedRequested';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_STAT_REQUESTED
     */
    get EVENT_SLACK_STAT_REQUESTED() {
        return 'slackStatRequested';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_BALANCE_REQUESTED
     */
    get EVENT_SLACK_BALANCE_REQUESTED() {
        return 'slackBalanceRequested';
    }

    /**
     * @static
     * @const {string} EVENT_SLACK_ADDRESS_REQUESTED
     */
    get EVENT_SLACK_ADDRESS_REQUESTED() {
        return 'slackAddressRequested';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_CONNECTED
     */
    get EVENT_STORAGE_CONNECTED() {
        return 'storageConnected';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_NOT_CONNECTED
     */
    get EVENT_STORAGE_NOT_CONNECTED() {
        return 'storageNotConnected';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_NO_WALLET
     */
    get EVENT_STORAGE_NO_WALLET() {
        return 'storageNoWalletFound';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_NO_WALLETS
     */
    get EVENT_STORAGE_NO_WALLETS() {
        return 'storageNoWalletsFound';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_NO_EMITTER_WALLET
     */
    get EVENT_STORAGE_NO_EMITTER_WALLET() {
        return 'storageNoEmitterWalletFound';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_NO_RECIPIENT_WALLET
     */
    get EVENT_STORAGE_NO_RECIPIENT_WALLET() {
        return 'storageNoRecipientWalletFound';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_TRANSFER_WAVES
     */
    get EVENT_STORAGE_TRANSFER_WAVES() {
        return 'storageWavesTransferRequested';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_TRANSFER_COMPLETED
     */
    get EVENT_STORAGE_TRANSFER_COMPLETED() {
        return 'storageWavesTransferCompleted';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_TRANSFER_NOT_COMPLETED
     */
    get EVENT_STORAGE_TRANSFER_NOT_COMPLETED() {
        return 'storageWavesTransferNotCompleted';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_SEED_REQUEST_FAILED
     */
    get EVENT_STORAGE_SEED_REQUEST_FAILED() {
        return 'storageSeedRequestFailed';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_SEED_REQUEST_SUCCEEDED
     */
    get EVENT_STORAGE_SEED_REQUEST_SUCCEEDED() {
        return 'storageSeedRequestSucceeded';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_ADDRESS_REQUEST_FAILED
     */
    get EVENT_STORAGE_ADDRESS_REQUEST_FAILED() {
        return 'storageAddressRequestFailed';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED
     */
    get EVENT_STORAGE_ADDRESS_REQUEST_SUCCEDED() {
        return 'storageAddressRequestSucceeded';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_REQUEST_BALANCE
     */
    get EVENT_STORAGE_REQUEST_BALANCE() {
        return 'storageBalanceRequested';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_STAT_REQUEST_FAILED
     */
    get EVENT_STORAGE_STAT_REQUEST_FAILED() {
        return 'storageBalanceRequestFailed';
    }

    /**
     * @static
     * @const {string} EVENT_STORAGE_STAT_REQUEST_SUCCEEDED
     */
    get EVENT_STORAGE_STAT_REQUEST_SUCCEEDED() {
        return 'storageBalanceRequestSucceeded';
    }

    /**
     * @constructor
     */
    constructor() {
        this._event = new EventEmitter();
    }

    /**
     * @method off
     *
     * @param {string} type
     * @param {Function} handler
     */
    sub(type, handler) {
        this._event.off(type, handler);
    }

    /**
     * @method pub
     *
     * @param {string} type
     * @param {object} data
     */
    pub(type, data = null) {
        data = data ? data : null;

        this._event.emit(type, {type, data});
    }

    /**
     * @method sub
     *
     * @param {string} type
     * @param {Function} handler
     */
    sub(type, handler) {
        this._event.on(type, handler);
    }

}

/**
 * @exports WavesSlackRewardBot.Event
 */
module.exports = Self;
