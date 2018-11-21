/**
 * Slack bot working with the Wavesplatform.API 
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 1.0
 * @license MIT
 */

/**
 * @const {object} CONF
 */
// const CONF = require('../conf.json');
const CONF = process.argv[2] ?
             require(`../conf.${process.argv[2]}.json`) :
             require('../conf.mainnet.json');

/**
 * @class WavesSlackRewardBot
 */
class Self {

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
        // Set link to global language vocabularies
        this._lang = Self.Lang;

        // Set link to global event emitter
        this._event = new Self.Event();

        // Bind some methods to the current context
        this._route = this._route.bind(this);

        // Add event handlers
        this._live();

        // Init submodules
        this._modules = {
            node : new Self.Node({event : this._event, error : Self.error}),
            slack : new Self.Slack({event : this._event, lang : this._lang, error : Self.error}),
            storage : new Self.Storage({event : this._event, error : Self.error})
        }
    }

    /**
     * @private
     * @method _live
     */
    _live() {
        if (CONF.DEV) {
            this._event.sub(this._event.EVENT_NODE_CONNECTED, this._route);
            this._event.sub(this._event.EVENT_NODE_NOT_CONNECTED, this._route);
            this._event.sub(this._event.EVENT_SLACK_CONNECTED, this._route);
            this._event.sub(this._event.EVENT_SLACK_NOT_CONNECTED, this._route);
            this._event.sub(this._event.EVENT_STORAGE_CONNECTED, this._route);
            this._event.sub(this._event.EVENT_STORAGE_NOT_CONNECTED, this._route);
        }
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
            case this._event.EVENT_NODE_CONNECTED:
                console.log(Self.Lang.MESSAGE_NODE_CONNECTED);
                break;

            // Waves API module isn't ready
            case this._event.EVENT_NODE_NOT_CONNECTED:
                console.log(Self.Lang.MESSAGE_NODE_NOT_CONNECTED);
                break;

            // Slack module is ready
            case this._event.EVENT_SLACK_CONNECTED:
                console.log(Self.Lang.MESSAGE_SLACK_CONNECTED);
                break;

            // Slack module isn't ready
            case this._event.EVENT_SLACK_NOT_CONNECTED:
                console.log(Self.Lang.MESSAGE_SLACK_NOT_CONNECTED);
                break;

            // Storage module is ready
            case this._event.EVENT_STORAGE_CONNECTED:
                console.log(Self.Lang.MESSAGE_STORAGE_CONNECTED);
                break;

            // Storage module isn't ready
            case this._event.EVENT_STORAGE_NOT_CONNECTED:
                console.log(Self.Lang.MESSAGE_STORAGE_NOT_CONNECTED);
                break;

        }
    }

}

/**
 * @requires ./WavesSlackRewardBot.Lang.js
 * @requires ./WavesSlackRewardBot.Node.js
 * @requires ./WavesSlackRewardBot.Event.js
 * @requires ./WavesSlackRewardBot.Slack.js
 * @requires ./WavesSlackRewardBot.Storage.js
 */
Self.Lang = require('./WavesSlackRewardBot.Lang.js');
Self.Node = require('./WavesSlackRewardBot.Node.js');
Self.Event = require('./WavesSlackRewardBot.Event.js');
Self.Slack = require('./WavesSlackRewardBot.Slack.js');
Self.Storage = require('./WavesSlackRewardBot.Storage.js');

/**
 * @exports WavesSlackRewardBot
 */
module.exports = Self;
