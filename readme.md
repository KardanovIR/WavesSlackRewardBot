# WavesSlackRewardBot

Slack bot working with custom crypto tokens based with the Wavesplatform.API.

## conf.json example

```
{
  "DEV" : false,
  "DB" : {
    "port" : "",
    "host" : "",
    "user" : "",
    "database" : "",
    "password" : "",
    "WALLETS_TABLE_NAME" : "wallets",
    "TRANSACTIONS_TABLE_NAME" : "transactions"
  },
  "SLACK_API" : {
    "SYMBOLS_LIMIT" : 3900,
    "MESSAGE_TIMEOUT" : 1000,
    "TOKEN" : "xoxb-{botToken}",
    "WORKSPACE" : "xoxb-{workspaceToken}",
    "REWARDED_REACTIONS" : ["+1", "clap", "clapping", "fire", "heart", "heavy_plus_sign"]
  },
  "WAVES_API" : {
    "BALANCE_URL" : "https://nodes.wavesplatform.com/assets/balance/{address}/{assetId}",
    "BALANCES_URL" : "http://nodes.wavesnodes.com/assets/{assetId}/distribution",
    "TRANSACTION_URL" : "https://nodes.wavesplatform.com/transactions/broadcast",
    "REQUEST_TIMEOUT" : 5000,
    "CONFIG_ALIAS" : "{TYPE_OF_CONFIG}",
    "FEE_AMOUNT" : 1,
    "ASSET_ID" : "{assetId}",
    "TRANSFER_LINK" : "https://wavesexplorer.com/tx/{transactionId}"
  }
}
```
