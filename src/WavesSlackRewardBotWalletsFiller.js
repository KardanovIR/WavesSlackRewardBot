// Conf
const CONF = require('../conf.json');

// libs
const {Client} = require('pg');
const {EventEmitter} = require('events');
const {RTMClient, WebClient} = require('@slack/client');
const WavesAPI = require('@waves/waves-api');

let SlackRewardBotWalletsFiller = (function() {

    // Class definition
    class Self {

        static get SQL_WALLET_ADD() {
            return `
                INSERT INTO ${CONF.DB.WALLETS_TABLE_NAME} (
                    slack_id,
                    wallet_phrase,
                    wallet_address,
                    wallet_created
                ) VALUES(
                    $1,
                    $2,
                    $3,
                    $4
                )
            `;
        }

        static get SQL_WALLETS_LIST() {
            return `
                SELECT
                    slack_id,
                    wallet_phrase,
                    wallet_address,
                    wallet_created
                FROM
                    ${CONF.DB.WALLETS_TABLE_NAME}
            `;
        }

        constructor() {
            // Create data stack
            this._data = {
            };

            // Init submodules
            this._modules = {
                node : WavesAPI.create(WavesAPI.TESTNET_CONFIG),
                slack : new WebClient(CONF.SLACK_API.token),
                storage : new Client(CONF.DB)
            };

            // 
            this._modules.storage.connect().
            then(() => {this._getStorageUsers()}).
            catch((exc) => {console.log(exc)});
        }

        _checkSlackUser(data) {
            var
                seed = null;

            // No need to go further
            if (this._data.users[data.id]) {
                return;
            }

            seed = new this._modules.node.Seed.create();

            this._modules.storage.query({
                text : Self.SQL_WALLET_ADD,
                values : [
                             data.id,
                             seed.phrase,
                             seed.address,
                             new Date()
                         ]
            }).
            then((data) => {
            }).
            catch((exc) => {console.log(exc)});
        }

        _getSlackUsers() {
            this._modules.slack.users.list().
            then((data) => {
                if (data && typeof data == 'object' && data.members instanceof Array) {
                    data.members.forEach(this._checkSlackUser, this);
                }
//                 console.log(data.members.length);
            }).
            catch((res) => {console.log(res)});
        }

        _getStorageUser(data) {
            this._data.users[data.slack_id] = data.wallet_id;
        }

        _getStorageUsers() {
            this._modules.storage.query({
                text : Self.SQL_WALLETS_LIST
            }).
            then((data) => {
                this._data.users = [];

                if (data && data.rowCount) {
                    data.rows.forEach(this._getStorageUser, this);
                }

                this._getSlackUsers();
            }).
            catch((exc) => {console.log(exc)});
        }

    }

    // Class export
    return Self;

})();



// Module export
module.exports = SlackRewardBotWalletsFiller;
