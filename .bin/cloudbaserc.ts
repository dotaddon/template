import { writeFileSync } from 'fs'
import { framework } from '../cloudbaserc.json'

let routes = Object.entries(framework.plugins.function.inputs.servicePaths)
    .map(([func,route])=>`${func} = '${route}'`)
let result = `// 本文件从 \`cloudbaserc.json\` 中自动生成
// 1. 更新servicePaths 后 
// 2. 运行 \`pnpm preDeploy\` 更新本文件
// 3. 运行 \`tcb framework deploy\` 即可完成云函数部署
/** 云函数api路由 */
declare const enum MsgMethod {
    ${routes.join(',\n    ')}
}`

writeFileSync('程序/shared/types/云函数名.d.ts', result)