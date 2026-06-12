# telegram-typeseter-bot

基于 `grammy` 的 Telegram 机器人，排版能力由 `Typeseter` 提供。

## 现在的接入方式

本项目不再维护一份独立排版核心，直接依赖 GitHub 上的 `Typeseter`：

- `typeseter`: `github:TinySnow/Typeseter#master`

详细对接文档见：[docs/typeseter-github-integration.md](./docs/typeseter-github-integration.md)

## 命令列表

- `/settings` — 查看当前所有排版选项
- `/mode <plain|markdown>` — 切换排版模式
- `/toggle <选项名>` — 开关某个选项（支持中文标签或 key 名）
- `/preset <poetry|default|strict>` — 应用预设配置
- `/reset` — 恢复默认设置
- 直接发送文本即可排版

## Quickstart

1. 安装依赖：

```bash
npm install
```

2. 启动：

```bash
npm run start
```

## 生产环境部署

### 自编译

1. 更改 `.env` 文件
2. 构建：

```bash
npm run build
```

3. 运行：

```bash
node dist/main.js
```

- 自编译的部署方式能减少内存占用到原来的 1/3

### Docker

1. 更改 `.env` 文件
2. `docker compose up -d --build`

## 环境变量

| 变量 | 必填 | 说明 |
|------|:--:|------|
| `BOT_TOKEN` | 是 | Telegram Bot Token |
| `SOCKS_PROXY` | 否 | SOCKS5 代理地址（如 `socks5h://127.0.0.1:7890`） |
| `TARGET_CHAT_ID` | 否 | 排版结果转发目标群组 ID，不设置则直接回复当前聊天 |

## Branch 约定

- `master`：对外公开，建议依赖稳定 commit/tag。
- `self-use`：自用部署分支，可先追新再回灌到 `master`。

## License

MIT
