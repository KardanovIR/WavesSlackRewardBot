/**
 * @const {object} CONF
 */
// const CONF = require('../conf.json');
const CONF = process.argv[2] ?
             require(`../conf.${process.argv[2]}.json`) :
             require('../conf.mainnet.json');

/**
 * @static
 * @class WavesSlackRewardBot.Lang
 */
class Self {

    /**
     * @static
     * @const {string} MESSAGE_NODE_CONNECTED
     */
    static get MESSAGE_NODE_CONNECTED() {
        return `Waves module is ready`;
    }

    /**
     * @static
     * @const {string} MESSAGE_NODE_NOT_CONNECTED
     */
    static get MESSAGE_NODE_NOT_CONNECTED() {
        return `Waves module isn't ready`;
    }

    /**
     * @static
     * @const {string} MESSAGE_SLACK_CONNECTED
     */
    static get MESSAGE_SLACK_CONNECTED() {
        return `Slack module is ready`;
    }

    /**
     * @static
     * @const {string} MESSAGE_SLACK_NOT_CONNECTED
     */
    static get MESSAGE_SLACK_NOT_CONNECTED() {
        return `Slack module isn't ready`;
    }

    /**
     * @static
     * @const {string} MESSAGE_STORAGE_CONNECTED
     */
    static get MESSAGE_STORAGE_CONNECTED() {
        return `Storage module is ready`;
    }

    /**
     * @static
     * @const {string} MESSAGE_STORAGE_NOT_CONNECTED
     */
    static get MESSAGE_STORAGE_NOT_CONNECTED() {
        return `Storage module isn't ready`;
    }

    /**
     * @static
     * @const {string} CURRENCY_ONE
     */
    static get CURRENCY_ONE() {
        return 'ThanksCoin';
    }

    /**
     * @static
     * @const {string} CURRENCY_TWO
     */
    static get CURRENCY_TWO() {
        return 'ThanksCoins';
    }

    /**
     * @static
     * @const {string} CURRENCY_ALL
     */
    static get CURRENCY_ALL() {
        return 'ThanksCoins';
    }

    /**
     * @static
     * @const {Array} CURRENCY_ALIASES
     */
    static get CURRENCY_ALIASES() {
        return [
            'ThanksCoin',
            'ThanksCoins',
            'Thankscoins',
            'thanksCoins',
            'thankscoins',
            'thank',
            'thanks',
            'thank you',
            'thave',
            'thaves',
            'coin',
            'coins',
            'token',
            'tokens',
            'монет',
            'монета',
            'монету',
            'монеты',
            'монетка',
            'монетки',
            'монетку',
            'монеток',
            'токен',
            'токена',
            'токенов',
            'благодарность',
            'благодарности',
            'благодарностей',
            'спасиб',
            'спасиба',
            'спасибо',
            'спасибу',
            'спасибы',
            'спасибов',
            'спасибищ',
            'спасибища',
            'спасибище'
        ];
    }

    /**
     * @static
     * @const {string} ANSWER_PONG
     */
    static get ANSWER_PONG() {
        return ':whale:';
    }

    /**
     * @static
     * @const {string} ANSWER_HELP
     */
    static get ANSWER_HELP() {
        var
            emojis = ':' + CONF.SLACK_API.REWARDED_REACTIONS.join(': :') + ':';

        return '' +
            '*Hi!*\n\n' +
            'My name\'s Billy and I\'m a dolphin. Twice a month you get 100 ThanksCoins on your wallet. And I can help you to transfer them to your colleagues.\n\n' +
            '*It can be done in three ways:*\n' +
            '*1.* Write a command like `@Billy 2 thanks @sasha` on the channel I\'ve been invited to and I\'ll transfer 2 thankscoins to the specified user;\n' +
            '*2.* Add emodji ' + emojis + ' to any message on the channel and I\'ll transfer 1 thankscoin to the author of the message;\n' +
            '*3.* Write me an IM with command like `10 thanks @sasha` and I\'ll transfer 10 thankscoins to the specified user.\n\n' +
            '*Also you can use following command in my IM:*\n' +
            '*•* `help` — list of the available commands;\n' +
            '*•* `address` — returns your wallet address;\n' +
            '*•* `balance` — returns your wallet balance;\n' +
            '*•* `balance @sasha` — returns wallet balance of the user you specified;\n' +
            '*•* `ping` — check out if I\'m online;\n' +
            '*•* `seed` — seed phrace of your wallet;\n' +
            '*•* `stat month` — statistics of received tokens for current month;\n' +
            '*•* `stat generosity` — statistics for transferred thankscoins for current month;\n' +
            '*•* `stat balances` — current balances amounts at the current moment.' +
            '';
    }

    /**
     * @static
     * @const {string} ANSWER_ADMIN_HELP
     */
    static get ANSWER_ADMIN_HELP() {
        var
            burnAmount = CONF.WAVES_API.REFILL_CHECKSUM,
            burnPluralized = Self.pluralize(
                                 burnAmount,
                                 Self.CURRENCY_ONE,
                                 Self.CURRENCY_TWO,
                                 Self.CURRENCY_ALL
                             ),
            refillAmount = CONF.WAVES_API.REFILL_AMOUNT,
            refillPluralized = Self.pluralize(
                                   refillAmount,
                                   Self.CURRENCY_ONE,
                                   Self.CURRENCY_TWO,
                                   Self.CURRENCY_ALL
                               );

        return Self.ANSWER_HELP +
            '\n\n' +
            '*Admin commands:*\n' +
            '*•* `whois` — get slack user by slack id or slack id by @user;\n' +
            '*•* `whoami` — get slack user for my slack id;\n' +
            '*•* `address @sasha` — get wallet address for given user;\n' +
            '*•* `wallets list` — get list of all wallets addresses;\n' +
            '*•* `wallets update` — create wallets for users added recently;\n' +
            '*•* `wallets refill` — refill wallets with ' + refillAmount + ' ' + refillPluralized + ' twice a month;\n' +
            '*•* `wallets burn` — burns ' + burnAmount + ' ' + burnPluralized + ' once a month.' +
            '';
    }

    /**
     * @static
     * @const {string} ANSWER_COMPUTING
     */
    static get ANSWER_COMPUTING() {
        return 'Computing...';
    }

    /**
     * @static
     * @const {string} ANSWER_CANNOT_COMPUTE
     */
    static get ANSWER_CANNOT_COMPUTE() {
        return 'Cannot compute';
    }

    /**
     * @static
     * @const {string} ANSWER_NOTHING_TO_SHOW
     */
    static get ANSWER_NOTHING_TO_SHOW() {
        return 'Nothing to show';
    }

    /**
     * @static
     * @const {string} ANSWER_OPERATION_FAILED
     */
    static get ANSWER_OPERATION_FAILED() {
        return 'Operation failed';
    }

    /**
     * @static
     * @const {string} ANSWER_NODE_REQUEST_ABORTED
     */
    static get ANSWER_NODE_REQUEST_ABORTED() {
        return '' +
            'Oops! Seems like some serious internal error has been happened while' +
            'transaction process.\n Try to make it later.';
    }

    /**
     * @static
     * @const {string} ANSWER_NODE_REQUEST_REJECTED
     */
    static get ANSWER_NODE_REQUEST_REJECTED() {
        return 'Your request rejected.';
    }

    /**
     * @static
     * @const {string} ANSWER_TRANSFER_COMPLETED
     */
    static get ANSWER_TRANSFER_COMPLETED() {
        return 'Your request completed. (*<${link}|${hash}>*)';
    }

    /**
     * @static
     * @const {string} ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT
     */
    static get ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT() {
        return 'User ${user} transferred to you <${link}|${amount} ${pluralized}>';
    }

    /**
     * @static
     * @const {string} ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT_WITH_MESSAGE
     */
    static get ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT_WITH_MESSAGE() {
        return Self.ANSWER_TRANSFER_COMPLETED_FOR_RECIPIENT + '\n> ${message}';
    }

    /**
     * @static
     * @const {string} ANSWER_THANK_YOU
     */
    static get ANSWER_THANK_YOU() {
        return 'Will try to do immediately. Thanks for your generosity.';
    }

    /**
     * @static
     * @const {string} ANSWER_NOT_TO_MYSELF
     */
    static get ANSWER_NOT_TO_MYSELF() {
        return 'I cannot afford it. I\'m at the service.';
    }

    /**
     * @static
     * @const {string} ANSWER_NOT_TO_YOURSELF
     */
    static get ANSWER_NOT_TO_YOURSELF() {
        return 'You\'re trying to transfer to yourself.';
    }

    /**
     * @static
     * @const {string} ANSWER_INCORRECT_SYNTAX
     */
    static get ANSWER_INCORRECT_SYNTAX() {
        return 'Incorrect syntax. You should write for example: *10 ThanksCoins @user_nick*';
    }

    /**
     * @static
     * @const {string} ANSWER_YOUR_SEED_IS
     */
    static get ANSWER_YOUR_SEED_IS() {
        return 'Your wallet seed is *${phrase}*';
    }

    /**
     * @static
     * @const {string} ANSWER_YOUR_SEED_IS_UNKNOWN
     */
    static get ANSWER_YOUR_SEED_IS_UNKNOWN() {
        return Self.ANSWER_YOUR_SEED_IS.
               replace('${phrase}', 'unknown');
    }

    /**
     * @static
     * @const {string} ANSWER_YOUR_ADDRESS_IS
     */
    static get ANSWER_YOUR_ADDRESS_IS() {
        return Self.ANSWER_USER_ADDRESS_IS.
               replace('${user}', 'Your');
    }

    /**
     * @static
     * @const {string} ANSWER_USER_ADDRESS_IS
     */
    static get ANSWER_USER_ADDRESS_IS() {
        return '${user} wallet address is *${address}*';
    }

    /**
     * @static
     * @const {string} ANSWER_YOUR_ADDRESS_IS_UNKNOWN
     */
    static get ANSWER_YOUR_ADDRESS_IS_UNKNOWN() {
        return Self.ANSWER_YOUR_ADDRESS_IS.
               replace('${address}', 'unknown');
    }

    /**
     * @static
     * @const {string} ANSWER_USER_BALANCE_IS
     */
    static get ANSWER_USER_BALANCE_IS() {
        return '${user} wallet balance is *${count}* ${pluralized}';
    }

    /**
     * @static
     * @const {string} ANSWER_YOUR_BALANCE_IS
     */
    static get ANSWER_YOUR_BALANCE_IS() {
        return Self.ANSWER_USER_BALANCE_IS.
               replace('${user}', 'Your');
    }

    /**
     * @static
     * @const {string} ANSWER_BALANCE_ISNT_COUNTED
     */
    static get ANSWER_BALANCE_ISNT_COUNTED() {
        return 'Wasn\'t able to count balance';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_FAILED
     */
    static get ANSWER_STAT_REQUEST_FAILED() {
        return Self.ANSWER_CANNOT_COMPUTE;
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_SUCCEEDED
     */
    static get ANSWER_STAT_REQUEST_SUCCEEDED() {
        return 'Statistics for ${head}:\n${body}';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_ITEM
     */
    static get ANSWER_STAT_REQUEST_ITEM() {
        return '\n${user} *${thaves}*';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_BREAK
     */
    static get ANSWER_STAT_REQUEST_BREAK() {
        return '\n…';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_HEAD_FOR_MONTH
     */
    static get ANSWER_STAT_REQUEST_HEAD_FOR_MONTH() {
        return 'month';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_HEAD_FOR_BALANCES
     */
    static get ANSWER_STAT_REQUEST_HEAD_FOR_BALANCES() {
        return 'balances';
    }

    /**
     * @static
     * @const {string} ANSWER_STAT_REQUEST_HEAD_FOR_GENEROSITY
     */
    static get ANSWER_STAT_REQUEST_HEAD_FOR_GENEROSITY() {
        return 'generosity';
    }

    /**
     * @static
     * @const {string} ANSWER_WALLETS_LIST_REQUEST_FAILED
     */
    static get ANSWER_WALLETS_LIST_REQUEST_FAILED() {
        return Self.ANSWER_CANNOT_COMPUTE;
    }

    /**
     * @static
     * @const {string} ANSWER_WALLETS_LIST_REQUEST_NOTHING
     */
    static get ANSWER_WALLETS_LIST_REQUEST_NOTHING() {
        return Self.ANSWER_NOTHING_TO_SHOW;
    }

    /**
     * @static
     * @const {string} ANSWER_ADMIN_ACCESS_REQUIRED
     */
    static get ANSWER_ADMIN_ACCESS_REQUIRED() {
        return 'Sorry this action requires admin permission which you don\'t have.'
    }

    /**
     * @static
     * @const {string} WALLET_ONE
     */
    static get WALLET_ONE() {
        return 'wallet';
    }

    /**
     * @static
     * @const {string} WALLET_TWO
     */
    static get WALLET_TWO() {
        return 'wallets';
    }

    /**
     * @static
     * @const {string} WALLET_ALL
     */
    static get WALLET_ALL() {
        return 'wallets';
    }

    /**
     * @static
     * @const {string} ANSWER_NEW_WALLETS_CREATED
     */
    static get ANSWER_NEW_WALLETS_CREATED() {
        return '*${count}* ${pluralized} created';
    }

    /**
     * @static
     * @const {string} ANSWER_ALL_WALLETS_REFILLED
     */
    static get ANSWER_ALL_WALLETS_REFILLED() {
        return '*${count}* ${pluralized} refilled';
    }

    /**
     * @static
     * @const {number} BURN_TABLE_COL_SPACE
     */
    static get BURN_TABLE_COL_SPACE() {
        return 2;
    }

    /**
     * @static
     * @const {number} BURN_TABLE_COL_WIDTH
     */
    static get BURN_TABLE_COL_WIDTH() {
        return 35;
    }

    /**
     * @static
     * @const {string} STAT_MONTH_TABLE_COL1_TITLE
     */
    static get BURN_TABLE_TITLE() {
        return 'Burned transactions';
    }

    /**
     * @static
     * @const {number} BURN_TABLE_BURNED_WALLETS_TITLE
     */
    static get BURN_TABLE_BURNED_WALLETS_TITLE() {
        return 'Succeeded';
    }

    /**
     * @static
     * @const {number} BURN_TABLE_REJECTED_WALLETS_TITLE
     */
    static get BURN_TABLE_REJECTED_WALLETS_TITLE() {
        return 'Rejected';
    }

    /**
     * @static
     * @const {number} STAT_TABLE_COL_SPACE
     */
    static get STAT_TABLE_COL_SPACE() {
        return 2;
    }

    /**
     * @static
     * @const {number} STAT_TABLE_COL1_WIDTH
     */
    static get STAT_TABLE_COL1_WIDTH() {
        return 35;
    }

    /**
     * @static
     * @const {number} STAT_TABLE_COL2_WIDTH
     */
    static get STAT_TABLE_COL2_WIDTH() {
        return 11;
    }

    /**
     * @static
     * @const {string} STAT_TABLE_IS_EMPTY
     */
    static get STAT_TABLE_IS_EMPTY() {
        return 'No values to count';
    }

    /**
     * @static
     * @const {string} STAT_MONTH_TABLE_TITLE
     */
    static get STAT_MONTH_TABLE_TITLE() {
        return 'Statistics for incoming';
    }

    /**
     * @static
     * @const {string} STAT_MONTH_TABLE_TOTAL
     */
    static get STAT_MONTH_TABLE_TOTAL() {
        return 'Totally received';
    }

    /**
     * @static
     * @const {string} STAT_MONTH_TABLE_COL1_TITLE
     */
    static get STAT_MONTH_TABLE_COL1_TITLE() {
        return 'Slack nick';
    }

    /**
     * @static
     * @const {string} STAT_MONTH_TABLE_COL2_TITLE
     */
    static get STAT_MONTH_TABLE_COL2_TITLE() {
        return 'Received';
    }

    /**
     * @static
     * @const {string} STAT_BALANCES_TABLE_TITLE
     */
    static get STAT_BALANCES_TABLE_TITLE() {
        return 'Statistics for wallets balances';
    }

    /**
     * @static
     * @const {string} STAT_BALANCES_TABLE_COL1_TITLE
     */
    static get STAT_BALANCES_TABLE_COL1_TITLE() {
        return 'Slack nick';
    }

    /**
     * @static
     * @const {string} STAT_BALANCES_TABLE_COL2_TITLE
     */
    static get STAT_BALANCES_TABLE_COL2_TITLE() {
        return 'Amount';
    }

    /**
     * @static
     * @const {string} STAT_GENEROSITY_TABLE_TITLE
     */
    static get STAT_GENEROSITY_TABLE_TITLE() {
        return 'Statistics for outgoing';
    }

    /**
     * @static
     * @const {string} STAT_GENEROSITY_TABLE_TOTAL
     */
    static get STAT_GENEROSITY_TABLE_TOTAL() {
        return 'Totally transferred';
    }

    /**
     * @static
     * @const {string} STAT_GENEROSITY_TABLE_COL1_TITLE
     */
    static get STAT_GENEROSITY_TABLE_COL1_TITLE() {
        return 'Slack nick';
    }

    /**
     * @static
     * @const {string} STAT_GENEROSITY_TABLE_COL2_TITLE
     */
    static get STAT_GENEROSITY_TABLE_COL2_TITLE() {
        return 'Transferred';
    }

    /**
     * @static
     * @method pluralize
     *
     * @param {number} num
     * @param {string|Array} one
     * @param {string=} two
     * @param {string=} all
     *
     * @returns {string}
     */
    static pluralize(num, one, two, all) {
        if (one instanceof Array) {
            all = one[2];
            two = one[1];
            one = one[0];
        }

        num = Math.abs(num);
        num %= 100;

        if (num >= 5 && num <= 20) {
            return all;
        }

        num %= 10;

        if (num == 1) {
            return one;
        } else if (num >= 2 && num <= 4) {
            return two;
        }

        return all;
    }

}

/**
 * @exports WavesSlackRewardBot.Lang
 */
module.exports = Self;
