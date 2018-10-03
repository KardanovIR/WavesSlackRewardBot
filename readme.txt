
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
            "token" : "xoxb-${SLACK_BOT_TOKEN}",
            "workspace" : "xoxb-${SLACK_WORKSPACE_TOKEN}"
        },
        "WAVES_API" : {
            "BROADCAST_PATH" : "",
            "CONFIG_ALIAS" : "",
            "FEE_AMOUNT" : 100000,
            "FEE_CURRENCY" : "WAVES",
            "ASSET_CURRENCY" : "WAVES",
            "TRANSFER_TIMEOUT" : 5000,
            "TRANSFER_LINK" : "https://wavesexplorer.com/tx/"
        }
    }
