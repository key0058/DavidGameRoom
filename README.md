# Node.js Getting started
在 LeanCloud 云引擎上使用 Express 的 Node.js 实例项目。

## 一键部署
[![Deploy to LeanEngine](http://ac-32vx10b9.clouddn.com/109bd02ee9f5875a.png)](https://leancloud.cn/1.1/engine/deploy-button)

## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，然后执行下列指令：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

安装依赖：

```
npm install
```

登录并关联应用：

```
lean login
lean switch
```

启动项目：

```
lean up
```

之后你就可以在 [localhost:3000](http://localhost:3000) 访问到你的应用了。

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

## Function
### joinRoom 加入房间，更新房号
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常

### leaveRoom 离开房间，清除房号
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常

### playingCards 开始游戏，根据人数各派5张牌
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常

## Hook
### afterUpdate 对象 Players.status
所有玩家准备，房间状态为READY
部分玩家准备，房间状态为IDLE
同时更新玩家数和准备玩家数

## 相关文档

* [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
* [JavaScript 开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)
* [JavaScript SDK API](https://leancloud.github.io/javascript-sdk/docs/)
* [Node.js SDK API](https://github.com/leancloud/leanengine-node-sdk/blob/master/API.md)
* [命令行工具使用指南](https://leancloud.cn/docs/leanengine_cli.html)
* [云引擎常见问题和解答](https://leancloud.cn/docs/leanengine_faq.html)
