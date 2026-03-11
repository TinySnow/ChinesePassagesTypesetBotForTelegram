# Typeseter GitHub 依赖对接说明

本文档描述如何把 `Typeseter` 作为 GitHub 依赖接入 Telegram Bot，并保持后续升级可控。

## 1. 目标

- Bot 仓库只负责 Telegram 收发。
- 排版逻辑全部复用 `Typeseter` 的 `src/bot` 适配层。
- 避免维护两套排版代码。

## 2. 依赖方式

`package.json`：

```json
{
  "dependencies": {
    "grammy": "^1.19.2",
    "typeseter": "github:TinySnow/Typeseter#master"
  },
  "devDependencies": {
    "tsx": "^4.21.0",
    "typescript": "^5.2.2"
  },
  "scripts": {
    "start": "tsx main.ts",
    "dev": "tsx watch main.ts"
  }
}
```

说明：

- `typeseter` 使用 GitHub 依赖，不要求先发布 npm 包。
- 本项目直接从 `typeseter/src/bot` 导入。
- 运行采用 `tsx`（转译运行），避免维护编译产物。

## 3. 对接入口（已在本仓库落地）

见 [main.ts](../main.ts)。

关键点：

1. 使用 `createTelegramHandler` 统一封装排版 + 长文本分片发送。
2. 使用 `createTelegramChatCfgStore` + `chatKey` 保存会话模式（plain / markdown）。
3. `grammy` 只负责命令和消息传输。

## 4. 运行

PowerShell 示例：

```powershell
npm install
npm run start
```

支持命令：

- `/plain`：切换到纯文本模式
- `/markdown`：切换到 Markdown 模式

## 5. 升级策略（推荐）

### `master`（公开分支）

建议不要长期跟踪 `#master`，而是改成固定版本：

- tag：`github:TinySnow/Typeseter#vX.Y.Z`
- commit：`github:TinySnow/Typeseter#<commit>`

这样对外可复现。

### `self-use`（自用部署分支）

可以先追 `#master` 或新 commit，验证后再同步到 `master`。

## 6. 常见问题

### Q1: `npm install` 时被改写成 `ssh://git@github.com/...`

这是本机 git 配置里有 `insteadOf` 规则导致。可检查：

```bash
git config --global --get-regexp "^url\\..*\\.insteadOf$"
```

清理/调整后再安装，避免走 SSH。

### Q2: 证书校验失败（如 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`）

通常是本机代理或企业证书链问题，先修复本机 npm/Node 证书与代理配置，再执行安装。

## 7. 约束说明

`Typeseter` 当前为源码仓库形态。对接时建议把导入范围限制在：

- `typeseter/src/bot`

这样未来 `Typeseter` 做内部重构时，Bot 侧改动面最小。
