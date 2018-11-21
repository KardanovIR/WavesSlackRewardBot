/**
 * @const {object} CONF
 */
// const CONF = require('../conf.json');
const CONF = process.argv[2] ?
             require(`../conf.${process.argv[2]}.json`) :
             require('../conf.mainnet.json');

/**
 * @class WavesSlackRewardBot.Request
 */
class Self {

    /**
     * @private
     * @member {object} _user
     */
    set _user(raw = {}) {
        var
            {id, seed, type, phrase, address} = raw;

        // Add emitent or recipient object if not exist
        this._data[type] = this._data[type] ? this._data[type] : {};

        // Check and add id field
        if (id && typeof id == 'string' && !this._data[type].id) {
            this._data[type].id = id;
        }

        // Check and add phrase field
        if (seed && typeof seed == 'string' && !this._data[type].seed) {
            this._data[type].seed = seed;
        }

        // Check and add phrase field
        if (phrase && typeof phrase == 'string' && !this._data[type].phrase) {
            this._data[type].phrase = phrase;
        }

        // Check and add address field
        if (address && typeof address == 'string' && !this._data[type].address) {
            this._data[type].address = address;
        }
    }

    /**
     * @member {boolean} ok
     */
    get ok() {
        return this._data.ok === true ? true : false;
    }

    set ok(raw) {
        if (raw) {
            this._data.ok = true;
        }

        this._data.ok = false;
    }

    /**
     * @member {object} stat
     */
    get stat() {
        return this._data.stat || {};
    }

    set stat(raw) {
        if (typeof raw == 'string') {
            raw = {alias : raw};
        }

        var
            {alias, list} = raw;

        // Create stat substack
        this._data.stat = this._data.stat ? this._data.stat : {};

        // Create alias field
        if (alias && typeof alias == 'string') {
            this._data.stat.alias = alias;
        }

        // Create list field
        if (list && (list instanceof Array)) {
            this._data.stat.list = list.slice();
        }
    }

    /**
     * @member {string} answer
     */
    get answer() {
        return this._data.answer || '';
    }

    set answer(raw) {
        if (raw && typeof raw == 'string') {
            this._data.answer = raw;
        }
    }

    /**
     * @member {object} update
     */
    get update() {
        return this._data.update || {};
    }

    set update(raw) {
        var
            {what, users} = raw;

        // Create update substack
        this._data.update = this._data.update ? this._data.update : {};

        // Create update subject key field
        if (what && typeof what == 'string') {
            this._data.update.what = what;
        }

        // Create update subject key field
        if (users && (users instanceof Array)) {
            this._data.update.users = users.slice();
        }
    }

    /**
     * @member {object} channel
     */
    get channel() {
        return this._data.channel || {};
    }

    set channel(raw) {
        raw = typeof raw == 'string' ? {id : raw} : raw;

        var
            {id} = raw;

        // Create channel substack
        this._data.channel = this._data.channel ? this._data.channel : {};

        // Create channel id field
        if (id && typeof id == 'string') {
            this._data.channel.id = id;
        }
    }

    /**
     * @member {object} emitent
     */
    get emitent() {
        return this._data.emitent || null;
    }

    set emitent(raw) {
        var
            type = 'emitent';

        // If given id as a string
        if (typeof raw == 'string') {
            raw = {id : raw};
        }

        // Pass data to _user setter
        this._user = {type, ...raw};
    }

    /**
     * @member {object} transfer
     */
    get transfer() {
        return this._data.transfer || {};
    }

    set transfer(raw) {
        var
            {id, amount, reason} = raw;

        // Create transfer substack
        this._data.transfer = this._data.transfer ? this._data.transfer : [];

        // Create transfer id field
        if (id && typeof id == 'string') {
            this._data.transfer.id = id;
        }

        // Create transfer amount field
        if (typeof amount == 'number' && amount >= 0) {
            this._data.transfer.amount = amount;
        }

        // Create transfer reason field
        if (reason && typeof reason == 'string') {
            this._data.transfer.reason = reason;
        }
    }

    /**
     * @member {object} recipient
     */
    get recipient() {
        return this._data.recipient || {};
    }

    set recipient(raw) {
        var
            type = 'recipient';

        // If given id as a string
        if (typeof raw == 'string') {
            raw = {id : raw};
        }

        // Pass data to _user setter
        this._user = {type, ...raw};
    }

    /**
     * @member {object} addresses
     */
    get addresses() {
        return this._data.addresses || {}
    }

    set addresses(raw) {
        var
            list = raw instanceof Array ? raw : raw.list;

        // Create addresses substack
        if (!this._data.addresses) {
            this._data.addresses = {};
        }

        // Create addresses list field
        this._data.addresses.list = list;

    }

    /**
     * @constructor
     *
     * @param {object} args
     */
    constructor(args) {
        var setters = Object.entries(Object.getOwnPropertyDescriptors(Self.prototype)).
                      filter(([key, descriptor]) => typeof descriptor.set === 'function').
                      map(([key]) => key);

        // Create data stack
        this._data = {};

        setters.forEach((item) => {
            if (args[item]) {
                this[item] = args[item];
            }
        });
    }

    /**
     * @method {valueOf}
     *
     * @returns {object}
     */
    valueOf() {
        return this._data;
    }

    /**
     * @method {toString}
     *
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this._data);
    }

}

/**
 * @exports WavesSlackRewardBot.Request
 */
module.exports = Self;
