# ChinesePassagesTypesetBotForTelegram

基于 `grammy` 的 Telegram 机器人，排版能力由 `Typeseter` 提供。

## 现在的接入方式

本项目不再维护一份独立排版核心，直接依赖 GitHub 上的 `Typeseter`：

- `typeseter`: `github:TinySnow/Typeseter#master`

详细对接文档见：[docs/typeseter-github-integration.md](./docs/typeseter-github-integration.md)

## Quickstart

1. 安装依赖：

```bash
npm install
```

2. 启动：

```bash
npm run start
```

## Branch 约定

- `master`：对外公开，建议依赖稳定 commit/tag。
- `self-use`：自用部署分支，可先追新再回灌到 `master`。

## License

MIT
