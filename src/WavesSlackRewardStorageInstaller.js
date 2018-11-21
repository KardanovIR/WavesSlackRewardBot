// Conf
const CONF = process.argv[2] ?
             require(`../conf.${process.argv[2]}.json`) :
             require('../conf.mainnet.json');

// libs
const {Client} = require('pg');



let WavesSlackRewardStorageInstaller = (function() {

    // Class definition
    class Self {

        static get MSG_WALLETS_TABLE_CREATED() {
            return `Table '${CONF.DB.WALLETS_TABLE_NAME}' created`;
        }

        static get MSG_TRANSACTIONS_TABLE_CREATED() {
            return `Table '${CONF.DB.TRANSACTIONS_TABLE_NAME}' created`;
        }

        /**
         * @static
         * @const {string} WALLETS_CREATE_TABLE
         */
        static get SQL_WALLETS_TABLE_CREATE() {
            return `
                CREATE TABLE IF NOT EXISTS ${CONF.DB.WALLETS_TABLE_NAME} (
                    slack_id varchar(20) PRIMARY KEY,
                    wallet_phrase text NOT NULL,
                    wallet_address varchar(50) NOT NULL,
                    wallet_created timestamp NOT NULL
                );
            `;
        }

        /**
         * @static
         * @const {string} TRANSACTIONS_CREATE_TABLE
         */
        static get SQL_TRANSACTIONS_TABLE_CREATE() {
            return `
                CREATE TABLE IF NOT EXISTS ${CONF.DB.TRANSACTIONS_TABLE_NAME} (
                    id serial PRIMARY KEY,
                    emitent_id varchar(20) NOT NULL,
                    recipient_id varchar(20) NOT NULL,
                    transaction_hash varchar(150) NOT NULL,
                    transaction_date timestamp NOT NULL,
                    transaction_amount int not null
                );
            `;
        }

        /**
         * @constructor
         */
        constructor() {
            this._client = new Client(CONF.DB);

            this._client.connect().
            then(() => {
                return this._client.query({
                    text : Self.SQL_WALLETS_TABLE_CREATE
                });
            }).
            then(() => {
                console.log(Self.MSG_WALLETS_TABLE_CREATED);

                return this._client.query({
                    text : Self.SQL_TRANSACTIONS_TABLE_CREATE
                });
            }).
            then(() => {
                console.log(Self.MSG_TRANSACTIONS_TABLE_CREATED);
                process.exit(0);
            }).
            catch((exc) => {console.log(exc)});
        }

    }

    // Class export
    return Self;

})();



// Module export
module.exports = WavesSlackRewardStorageInstaller;
