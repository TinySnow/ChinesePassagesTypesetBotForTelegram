# ChinesePassagesTypesetBotForTelegram

## Purpose / 目的

- A very simple bot for typesetting the chinese passages in telegram.

    - 一个简易的排版处理机器人，用于处理 Telegram 上的中文文本。

## Premise / 前提

- The version of `Node.js` must above `16`.

    - `Node.js` 版本需要大于 `16`。

- Install `typescript` and `grammy` (You can just simply execute `npm install`, it will automaicly be done).

    - 安装 `typescript` 和 `grammy`（你可以只用简单执行 `npm install`，它会自动完成）。

## Quickstart / 快速开始

1. Input your telegram bot token into `const bot = new Bot("========Your Token Here========");` in `main.ts`.

    - 将你的 telegram bot token 放置在 `main.ts` 中的 `const bot = new Bot("=======你的 Token======");` 中；

2. Process your logic after `//   Process your logic after this line / 在这行之后处理你的逻辑` of `main.ts`, for example, you can foward the typesetted message(vairable name: `result`) to specific group, channel or user.

    - 在 `main.ts` 的 `//   Process your logic after this line / 在这行之后处理你的逻辑` 一行后处理你的逻辑，例如，你可以转发排版后的消息（变量名称：`result`）到特定的群组、频道或者用户。

3. Compile typescript code using `npx tsc` in root.

    - 使用 `npx tsc` 编译 typescript 代码。

4. Continually run `main.js`, which is the compiled product. You can use `node main.js` in `tmux` or `screen`.

    - 持续运行 `main.js`。你可以在 `tmux` 或 `screen` 中使用 `node main.js`。

5. Enjoy!

## NOTICE / 注意

- **You need a network environment that can connect to Telegram servers, especially for Chinese users.**

    - **你需要一个能够连接上 Telegram 服务器的网络环境，尤其是对于中国用户而言。**

## Framework / 框架

- [Grammy](https://grammy.dev) Telegram bot framework.

    - [Grammy](https://grammy.dev/zh/) Telegram bot 框架。

## License / 开源许可证

- MIT License.