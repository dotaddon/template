
const cloudbase = require("@cloudbase/node-sdk");

/** 游戏结算 */
exports.default = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const app = cloudbase.init({ env: context.namespace });
    const db = app.database();
    const _ = db.command;
    const resBody = JSON.parse(event.body)
    console.log(resBody)
    return 'success'
}