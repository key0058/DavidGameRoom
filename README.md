# David Game Room
一个简单扑克游戏的云服务端代码

## Function
### joinRoom 加入房间，更新房号
```
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常
```

### leaveRoom 离开房间，清除房号
```
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常
```

### playingCards 开始游戏，根据人数各派5张牌
```
参数：roomId，playerId（userId）
成功返回：SUCCESS
错误则抛出异常
```

## Hook
### afterUpdate 对象 Players.status
```
统计
1. 玩家数
2. 准备玩家数
3. 完结玩家数

当房间为IDLE  --> 玩家与准备相同   --> 则状态更改为READY
当房间为READY --> 玩家与准备不相同 --> 则状态更改为IDLE
当房间为PLAY  --> 玩家与完结相同   --> 则状态更改为END
当房间为END   --> 玩家与准备相同   --> 则状态更改为READY

同时更新玩家数和准备玩家数
```

## 相关文档

* [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
* [JavaScript 开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)
* [JavaScript SDK API](https://leancloud.github.io/javascript-sdk/docs/)
* [Node.js SDK API](https://github.com/leancloud/leanengine-node-sdk/blob/master/API.md)
* [命令行工具使用指南](https://leancloud.cn/docs/leanengine_cli.html)
* [云引擎常见问题和解答](https://leancloud.cn/docs/leanengine_faq.html)
