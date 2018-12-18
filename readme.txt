
    Slack bot working with the Wavesplatform.API 


    Configuration:

    Create conf.json in the project root directory, with the following structure:

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
        "REWARDED_REACTIONS" : ["+1", "clap", "clapping", "fire", "heart", "heavy_plus_sign"],
        "ADMINS_LIST" : ["{SLACK_ID_1}", "{SLACK_ID_2}"]
      },
      "WAVES_API" : {
        "BALANCE_URL" : "https://nodes.wavesplatform.com/assets/balance/{address}/{assetId}",
        "BALANCES_URL" : "http://nodes.wavesnodes.com/assets/{assetId}/distribution",
        "TRANSACTION_URL" : "https://nodes.wavesplatform.com/transactions/broadcast",
        "REQUEST_TIMEOUT" : 5000,
        "CONFIG_ALIAS" : "{TYPE_OF_CONFIG}",
        "FEE_AMOUNT" : 1,
        "BURN_FEE_AMOUNT" : 1,
        "REFILL_AMOUNT" : 100,
        "REFILL_CHECKSUM" : 200,
        "REFILL_REQUESTS_LIMIT" : 100,
        "REFILL_SEED" : "",
        "REFILL_ADDRESS" : "",
        "ASSET_ID" : "{assetId}",
        "TRANSFER_LINK" : "https://wavesexplorer.com/tx/{transactionId}"
      }
    }

