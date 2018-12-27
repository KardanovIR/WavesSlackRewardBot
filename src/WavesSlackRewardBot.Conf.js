const CONF_POS = process.argv.indexOf('--conf');
const CONF_TYPE = CONF_POS != -1 ? process.argv[CONF_POS + 1] : undefined;

module.exports = CONF_TYPE ?
                 require(`../conf.${CONF_TYPE}.json`) :
                 require('../conf.mainnet.json');
