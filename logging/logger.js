/* 
 * in OpenShift time is GMT+0, so we add +3 (for debugging in Lithuania time [EEST])
*/

const logger = {
  info: (message) => {
    const today = new Date();
    const formatedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${today.getHours()+3}:${today.getMinutes()}:${today.getMilliseconds()}`;
    console.info(`[INFO] ${formatedDate} - ${message}`);
  },
  error: (message) => {
    const today = new Date();
    const formatedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${today.getHours()+3}:${today.getMinutes()}:${today.getMilliseconds()}`;
    console.error(`[ERROR] ${formatedDate} - ${message}`);
  }
}

module.exports = logger;