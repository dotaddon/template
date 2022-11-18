# `<div align='center' ><font size='70'>`TsDotaRPG 2.0`</font></div>`

## 梗概

* dota2 自定义游戏开发模板，全汉化目录结构
* 根据一年来的开发经验，在1.3.3的基础上做了大幅度修改
* 借鉴了以下作者的开发工具：
  * Moddota
  * ark120202[已故]
  * Xavier
  * 西索酱

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![](https://img.shields.io/badge/模版-DOtA2-red.svg?colorA=abcdef)
![](https://img.shields.io/badge/语言-typescript-blue.svg)
![](https://img.shields.io/badge/全景-react-9cf.svg)

<!-- ![Version](https://img.shields.io/gitee/v/takegine/ts-dota-rpg.svg) -->

# 内容概览

## 功能概述

1. 用 `react`来写dota2全景,实时编译
2. 用 `TypeScript`写dota2自定义RPG脚本,实时编译
3. 将 `表格/npc`文件夹的 `.xlsx`文件同步到 `game/scripts/npc`，编译为dota2的kv文件
4. 将 `表格/localization`文件夹的 `.xlsx`文件同步到 `game/resources`，编译为dota2的语言文件
5. 将 `game/scripts/npc`文件夹的内容同步到 `content/panorama/scripts/keyvalues.js`
6. 批量编译地图、特效、全景图片资源

## 文件夹内容

| 文件夹名      | 功用                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| 编译/content  | 同步更新 `/dota 2 beta/content/dota_addons/<addon_name>`              |
| 编译/game     | 同步更新 `/dota 2 beta/game/dota_addons/<addon_name>`                 |
| 编译/publish? | 发布包，`/dota 2 beta/game/dota_addons/<addon_name>_publish`          |
| 代码前端      | 基于react的web编译，编辑界面和交互功能                                  |
| 代码后端      | 基于TS来写游戏主程序，技能等等                                          |
| 代码通讯      | 用来写 `panorama ts`和 `tstl`公用的声明，如 `custom_net_tables`等 |
| 表格          | 用来写物编、KV 表及本地话文本                                           |
| 地图          | 存放 `Hammer`用的*.vmap文件                                           |
| 贴图          | 存放 `MaterialEditor`用的*.vtex文件及相关图片                         |
| 模型          | 存放 `ModelEditor`用的*.vmat文件及相关模型                            |
| 特效          | 存放 `ParticleEditor`用的*.vpcf文件                                   |
| toolCode      | 各种 node 脚本，用来完成各种辅助功能                                    |
| node_modules? | 开发依赖                                                                |
|               |                                                                         |

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

1. 安装 `node.js`，要求是 above Node v14.10.1 ~~因为低于这个版本的没有测试过~~
2. `clone` 或 `fork` [本项目](https://gitee.com/takegine/ts-dota-rpg/members#)
3. 打开 `dota2.config.json`，将 `FolderName`修改为你自己喜欢的名字。全小写
4. 安装依赖
```bash
# 包管理工具
npm i -g pnpm
# ts执行工具
npm i -g tsx
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
pnpm launch [--a <addon_name>] [--m <map_name>]

# 进入 开发 模式
# 监听且实时编译全栈代码，
# 自动把images目录下的所有图片写入样式，需要启动一次游戏实现编译
pnpm dev

# 执行 编译 操作
# 自动编译content 目录下的所有资源到 game目录下
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

4. 如果你需要加密，请自行修改 `toolCode/publish.js`

## 未来的计划

5. 欢迎提 `issues`
6. 欢迎贡献代码

# 鸣谢

- ModDota Community
- `ark120202` 开发的[react-panorama](https://github.com/ark120202/react-panorama "react全景的github仓库")和对 [API](https://moddota.com/api/#!/vscripts/functions#CreateUnitFromTable) 的维护
- 部分代码源自 `MODDOTA` 的 [TypeScriptAddonTemplate](https://github.com/MODDOTA/TypeScriptAddonTemplate)
- 模版主体源自 `Xavier` 的 [X-Template](https://github.com/XavierCHN/x-template/)
