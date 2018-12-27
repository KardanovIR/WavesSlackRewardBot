# WavesSlackRewardBot

Slack bot working with custom crypto tokens based with the Wavesplatform.API.

## Installation

* Create Waves wallet [here](https://client.wavesplatform.com) or you can use existant wallet;
* Create a [token](https://docs.wavesplatform.com/en/waves-client/assets-management/issue-an-asset.html) of sponsored type;
* Create a [bot](https://get.slack.help/hc/en-us/articles/115005265703-Create-a-bot-for-your-workspace) in your slack namespace;
* `git clone git@github.com:Shushik/WavesSlackRewardBot.git`;
* `cd WavesSlackRewardBot`;
* Install npm and postgres if not yet;
* `npm install`;
* Create [user](https://www.postgresql.org/docs/9.5/sql-createuser.html) and [database](https://www.postgresql.org/docs/9.1/sql-createdatabase.html) for postgres;
* Create `conf.mainnet.json` file in the project root directory and copy the config structure below;
* Fill {UPPERCASED_PLACEHOLDERS} in config with the needed values except ADMINS_LIST field, which will be tuned further;
* `node install.js` — will create tables with the neede structure in DB.

## After installation

* Run bot with `node run.js`;
* Go to bot PM and type `whoami` and get you slack ID;
* Stop bot with `Ctrl+C`;
* Open `conf.mainnet.json` and add your slack ID into ADMINS_LIST section;
* Run bot again using `pm2 start BillyBot`;
* Type `help` in bot PM to get list of available commands;
* ...;
* PROFIT!.

## Several bots running

You can run several BillyBot instances by just creating `conf.{YOUR_CONFIG_NAME}.json` in the project root directory and using `node run.js --conf {YOUR_CONFIG_NAME}` command.

## conf.json example

```
{
  "DEV" : false,
  "DB" : {
    "port" : "{POSTGRES_PORT}",
    "host" : "{POSTGRES_HOST}",
    "user" : "{POSTGRES_USER}",
    "database" : "{POSTGRES_DATABASE}",
    "password" : "{POSTGRES_PASSWORD}",
    "WALLETS_TABLE_NAME" : "wallets",
    "TRANSACTIONS_TABLE_NAME" : "transactions"
  },
  "SLACK_API" : {
    "SYMBOLS_LIMIT" : 3900,
    "MESSAGE_TIMEOUT" : 1000,
    "TOKEN" : "xoxb-{YOUR_SLACK_BOT_TOKEN}",
    "WORKSPACE" : "xoxb-{YOUR_SLACK_WORKSPACE_TOKEN}",
    "REWARDED_REACTIONS" : ["+1", "clap", "clapping", "fire", "heart", "heavy_plus_sign"],
    "ADMINS_LIST" : ["{SLACK_ID_1}", "{SLACK_ID_2}"]
  },
  "WAVES_API" : {
    "BALANCE_URL" : "https://nodes.wavesplatform.com/assets/balance/{address}/{assetId}",
    "BALANCES_URL" : "http://nodes.wavesnodes.com/assets/{assetId}/distribution",
    "TRANSACTION_URL" : "https://nodes.wavesplatform.com/transactions/broadcast",
    "REQUEST_TIMEOUT" : 5000,
    "CONFIG_ALIAS" : "{MAINNET_OR_TESTNET}",
    "FEE_AMOUNT" : 1,
    "EMOJI_AMOUNT" : 1,
    "BURN_FEE_AMOUNT" : 1,
    "REFILL_AMOUNT" : 100,
    "REFILL_CHECKSUM" : 200,
    "REFILL_REQUESTS_LIMIT" : 100,
    "REFILL_SEED" : "{YOUR_WAVES_WALLET_SEED_PHRASE}",
    "REFILL_ADDRESS" : "{YOUR_WAVES_WALLET_ADDRESS}",
    "ASSET_ID" : "{YOUR_ASSET_ID}",
    "TRANSFER_LINK" : "https://wavesexplorer.com/tx/{transactionId}"
  }
}
```
