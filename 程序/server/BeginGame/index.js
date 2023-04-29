
const cloudbase = require("@cloudbase/node-sdk");

/** 游戏启动 */
exports.default = async (event, context) => {
    const app = cloudbase.init({ env: context.namespace });
    const db = app.database();
    const _ = db.command;
    const resBody = JSON.parse(event.body)
    console.log(resBody)
    
    return Promise.all(
        resBody.map(e => db
            .collection('user')
            .doc(e.DotaId)
            .get()
        )
    )
}