# <div align='center' ><font size='70'>TsDotaRPG</font></div>

## 梗概
* dota2 自定义游戏开发模板
* 贡献者：
  * Moddota
  * ark120202[已故]
  * Xavier
  * 西索酱

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) 
![](https://img.shields.io/badge/模版-DOtA2-red.svg?colorA=abcdef)
![](https://img.shields.io/badge/语言-typescript-blue.svg)
![](https://img.shields.io/badge/全景-react-9cf.svg)
<!-- ![Version](https://img.shields.io/gitee/v/takegine/ts-dota-rpg.svg) -->
### 使用条件

如果你要使用这个模板，通常需要拥有以下知识储备：

1. <b>掌握</b>[Dota2 Workshop Tools](https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools:zh-cn "V 社的创意工坊开发文档") <b>了解</b>[Dota2 创意工坊工具集](https://support.steampowered.com/kb_cat.php?id=109 )
2. <b>掌握</b>[TypeScript](https://www.tslang.cn/ "TypeScript的官方文档"), `JavaScript` 的语法，<b>了解</b>[TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua "ts2l的github仓库")
3. <b>掌握</b>[react](https://react.docschina.org/ "react的官方文档")的基础知识 和 <b>了解</b> [react-panorama](https://github.com/ark120202/react-panorama "react全景的github仓库") 
5. <b>了解</b>[node.js](https://nodejs.org/zh-cn/docs/ "nodejs的官方文档")的基础知识
- 你可以在完成[安装依赖](###使用步骤)后，查看`node_modules/@moddota/`中的`dota-lua-types`和`panorama-types` 来了解 `DOTA2 Typescript API`

- Xavier：当然，使用强类型语言需要你有更好的代码规范和写声明的觉悟 :wink:
- Xavier：不过也能提升你的代码效率就是了

### 功能概述
#### 已实现功能
1. 将`excels`文件夹的内容变成 kv 文件并放到`game/scripts/npc`文件夹
2. 将`localization`文件夹的内容生成对应的语言文件并放到`game/resources`文件夹
3. 将`game/scripts/npc`文件夹的内容同步到`content/panorama/scripts/keyvalues.js`
#### 可拓展的功能
4. 如果你需要加密，请自行修改`scripts/publish.js`
#### 未来的计划
5. 欢迎提 `issues`
6. 欢迎贡献代码
### 支持的指令
```bash
# 启动 dota2
# 如果提供了 <addon_name> 则会载入指定的 addon（默认该项目）
# 如果提供了  <map_name>  则会自动载入对应的地图名
npm run launch [--a <addon_name>] [--m <map_name>]

# 进入 开发 模式
# 监听且实时编译:ts 2 lua，KV 2 js，Excel 2 KV，Excel 2 localization
npm run dev

# 执行 发布 操作
# 将会自动生成 publish 文件夹
# 并自动 link 到 dota_addons/<addon_name>_publish 文件夹 之后
# 你可以选择这个文件夹发布
npm run pro
```
### 使用步骤

1. 安装`node.js`，要求是 above Node v14.10.1 ~~因为低于这个版本的没有测试过~~
2. `clone` 或 `fork` [本项目](https://gitee.com/takegine/ts-dota-rpg/members#)
3. 打开`package.json`，将`name`修改为你自己喜欢的名字。全小写
4. 执行`npm install`安装依赖，他应该会自动 link`content`,`game`文件夹到你的`dota 2 beta/dota_addons`,(如果碰到权限问题，请尝试重启)
5. `npm run dev`，开始你的开发

### 文件夹内容
| 文件夹名| 功用|
|---|---|
content | 同步更新 `/dota 2 beta/content/dota_addons/<addon_name>` 
game | 同步更新 `/dota 2 beta/game/dota_addons/<addon_name>` 
declaration | 用来写`panorama ts`和`tstl`公用的声明，如`custom_net_tables`等
excels | 用来写 KV 表和各种本地化文本
scripts | 各种 node 脚本，用来完成各种辅助功能
node_modules?| 开发依赖
publish? | 发布包，`/dota 2 beta/game/dota_addons/<addon_name>_publish` 


### 鸣谢

- ModDota Community
- `ark120202` 开发的[react-panorama](https://github.com/ark120202/react-panorama "react全景的github仓库")和对 [API](https://moddota.com/api/#!/vscripts/functions#CreateUnitFromTable) 的维护
- 部分代码源自 `MODDOTA` 的 [TypeScriptAddonTemplate](https://github.com/MODDOTA/TypeScriptAddonTemplate)
- 模版主体源自 `Xavier` 的 [X-Template](https://github.com/XavierCHN/x-template/)