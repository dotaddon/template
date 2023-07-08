// 启动项目
import { dotaLaunch, dotaTool } from "@dotaddon/rigger";

require('./console')

dotaTool('vconsole2', undefined)
dotaLaunch()
    .then((e) => {
        console.log(e)
        process.exit(1)
    }).catch(e => console.error(e))