import { Bot } from "grammy";
import { typeset } from "./utils/typeset";
import { defaultOption } from "./model/default-option";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间

// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时，grammY 将调用已注册的监听器。

// 处理 /start 命令。
bot.command("start", async (ctx) => {
  ctx.reply("Start 命令没什么用处，请探索机器人的其他神秘用法。");
});
// 处理其他的消息。
bot.on("message", (ctx) => {
  let message = ctx.message.text as string;
  let result = typeset(message, defaultOption);
//   Process your logic after this line / 在这行之后处理你的逻辑

});

// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。

// 启动 bot。
bot.start();
