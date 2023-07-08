//本文件从cloudbaserc.json 中自动生成
// 1. 更新servicePaths 后 
// 2. 运行 `pnpm preDeploy` 更新本文件
// 3. 运行 `tcb framework deploy` 即可完成云函数部署
/** 云函数api路由 */
declare const enum MsgMethod {
    BeginGame = '/beginGame',
    EndinGame = '/endinGame',
}