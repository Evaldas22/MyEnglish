const moment = require('moment');

const logger = {
  info: (message) => {
    console.info(`[INFO] [${moment(Date.now()).utcOffset('+0300').format('YYYY-MM-DD h:mm:ss a')}]  ${message}`);
  },
  error: (message) => {
    console.error(`[ERROR] [${moment(Date.now()).utcOffset('+0300').format('YYYY-MM-DD h:mm:ss a')}]  ${message}`);
  }
}

module.exports = logger;