# `<div align='center' ><font size='70'>`TsDotaRPG 3.0`</font></div>`

## 梗概

* `1.0` dota2 自定义游戏开发模板，全汉化目录结构
* `2.0` 根据疫情期间的开发经验，在1.3.3的基础上做了大幅度修改
* `3.0` 看在捐款的份上更新的

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![](https://img.shields.io/badge/模版-DOtA2-red.svg?colorA=abcdef)
![](https://img.shields.io/badge/语言-typescript-blue.svg)
![](https://img.shields.io/badge/全景-react-9cf.svg)

<!-- ![Version](https://img.shields.io/gitee/v/takegine/ts-dota-rpg.svg) -->

# 内容概览

## 功能概述

1. 用 `react`来写dota2全景,实时编译
2. 用 `TypeScript`写dota2自定义RPG脚本,实时编译
3. 将 `方言`文件夹的 `.xlsx`文件输出到 `game/resources`，编译为dota2的语言文件
4. 批量编译地图、特效、全景图片资源

## 文件夹内容

| 文件夹名 | 功用 |
| --- | --- |
| 编译/content  | 同步更新 `/dota 2 beta/content/dota_addons/<addon_name>` |
| 编译/game     | 同步更新 `/dota 2 beta/game/dota_addons/<addon_name>` |
| 程序/panorama | 基于react的web编译，编辑界面和交互功能。同时支持 less与scss |
| 程序/vscripts | 基于TS来写游戏主程序，触发，技能等等 |
| 程序/server   | 用来放服务器代码，已给出腾讯云函数示例代码 |
| 程序/shared   | 用来写 `panorama ts`和 `tstl`公用的声明，如 `custom_net_tables`等 |
| 程序/npc   | 存放 实体 配置文件 |
| 程序/音效   | 存放 音效 配置文件 |
| 方言  | i18n, 表格配置  |
| 策划          | 提供给策划人员放置文档、表格的目录 |
| 美术/地形     | 存放 `Hammer`用的*.vmap文件 |
| 美术/贴图     | 存放 `MaterialEditor`用的*.vtex文件及相关图片 |
| 美术/模型     | 存放 `ModelEditor`用的*.vmat文件及相关模型 |
| 美术/特效     | 存放 `ParticleEditor`用的*.vpcf文件 |
| 美术/图标     | 存放 技能、道具、buff图标 |
| 美术/切图     | 存放 前端界面用的切图 |
| 美术/音频     | 存放 音频文件 供`程序/音效`使用 |
| .bin          | 各种 node 脚本，用来完成各种辅助功能 |
| node_modules? | 开发依赖 |
| | |

# 使用

## 使用须知

如果你要使用这个模板，通常需要拥有以下知识储备：

1. <b>掌握</b>[Dota2 Workshop Tools](https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools:zh-cn "V 社的创意工坊开发文档") <b>了解</b>[Dota2 创意工坊工具集](https://support.steampowered.com/kb_cat.php?id=109)
2. <b>掌握</b>[TypeScript](https://www.tslang.cn/ "TypeScript的官方文档"), `JavaScript` 的语法，<b>了解</b>[TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua "ts2l的github仓库")
3. <b>掌握</b>[react](https://react.docschina.org/ "react的官方文档")的基础知识 和 <b>了解</b> [react-panorama](https://github.com/ark120202/react-panorama "react全景的github仓库")
4. <b>了解</b>[node.js](https://nodejs.org/zh-cn/docs/ "nodejs的官方文档")的基础知识

- 你可以在完成[安装依赖](###使用步骤)后，查看 `node_modules/@moddota/`中的 `dota-lua-types`和 `panorama-types` 来了解 `DOTA2 Typescript API`
- Xavier：当然，使用强类型语言需要你有更好的代码规范和写声明的觉悟 😉
- Xavier：不过也能提升你的代码效率就是了

## 使用步骤

1. 安装nodejs
  * 版本要求是 [node@16.19](https://nodejs.org/zh-cn), 
  * 推荐直接下载 [volta](https://volta.sh/) 进行node 版本管理
2. `clone` 或 `fork` [本项目](https://gitee.com/kill-seven-at-once/ts-dota-rpg.git)
3. 必要配置项目
  * 打开 `dota2.config.json`，
  * `FolderName`为文件目录名，全小写
  * `DefaultMap`为启动地图名，全小写
4. 安装依赖
```bash
# 包管理工具
npm i -g pnpm
# volta 安装方式
volta install pnpm
# ts执行工具
pnpm add -g tsx
```
5. 初始化
```bash
# 安装依赖与配置环境
pnpm i
```
6. `pnpm dev`，开始你的开发



### 其他常用方法
```bash
# 执行dev 并 启动游戏
pnpm go
    
# 启动 dota2
# 如果提供了 <addon_name> 则会载入指定的 addon（默认该项目）
# 如果提供了  <map_name>  则会自动载入对应的地图名
pnpm launch

# 进入 开发 模式
# 监听且实时编译全栈代码，
# 自动把images目录下的所有图片写入样式，需要启动一次游戏实现编译
pnpm dev

# 执行 资源构建 操作
# 自动编译content 目录下的资源到 game 目录下
pnpm compile

# 更新 图片编译目录
pnpm images

# 规范代码
pnpm lint

# 安装vscode插件
# 会在编辑器下方提供快捷按钮
# 如果您使用了vscode作为IDE，那么可以使用本条指令快速安装推荐插件
# 插件不是使用本模版的必备条件，但可以方便码代码
pnpm suggest


# 执行 发布 操作
# 将会自动生成 publish 文件夹
# 并自动 link 到 dota_addons/<addon_name>_publish 文件夹 之后
# 你可以选择这个文件夹发布
pnpm build
```

## 可拓展的功能
  1. 网表配置文件
  `程序\shared\dota_net_table_keys.json` 输出到 `dist\game\scripts\custom_net_tables.txt`
  2. 切图预载入
  基于 `美术\切图`的相对目录,填写`dota2.config.json`的`images`中 
  3. 特效模型预载入
  将lua中包含相关后缀名的字符串准备到`程序\vscripts\init`目录下

## 未来的计划
  欢迎提 `issues`
  欢迎贡献代码

## QQ群
  450567454 新生代大神群，突出一个ts开发，敏捷交付。人数少爱闲聊。
  347735258 古早大神群，突出一个老鸽子基地，群英荟萃。人数太多，建议给群主赞助，不然他老是忘记续费QQ会员。


# 鸣谢

- ModDota Community
- `ark120202`[已故] 开发的[react-panorama](https://github.com/ark120202/react-panorama "react全景的github仓库")和对 [API](https://moddota.com/api/#!/vscripts/functions#CreateUnitFromTable) 的维护
- 部分代码源自 `MODDOTA` 的 [TypeScriptAddonTemplate](https://github.com/MODDOTA/TypeScriptAddonTemplate)
- 模版主体源自 `Xavier` 的 [X-Template](https://github.com/XavierCHN/x-template/)
- robinCode、Demon、Xavier、unco 提供的技术支持
- 云端、1、unco 等社区同学对此脚手架的支持