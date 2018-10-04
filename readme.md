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
            "SYMBOLS_LIMIT" : 3950,
            "TOKEN" : "xoxb-your-slack-bot-token",
            "WORKSPACE" : "xoxb-your-slack-workspace-token"
        },
        "CURRENCY" : {
            "ONE" : "coin",
            "TWO" : "coins",
            "ALL" : "coins"
        },
        "WAVES_API" : {
            "BALANCE_URL" : "url_to_node_api/${address}/${assetId}",
            "TRANSACTION_URL" : "url_to_node_api/transactions/broadcast",
            "REQUEST_TIMEOUT" : 5000,
            "CONFIG_ALIAS" : "CONFIG_TYPE",
            "ASSET_ID" : "your_asset_id_hash",
            "TRANSFER_LINK" : "https://wavesexplorer.com/tx/${transactionId}"
        }
    }
```
