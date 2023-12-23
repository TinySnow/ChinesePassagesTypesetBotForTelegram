"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const typeset_1 = require("./utils/typeset");
const default_option_1 = require("./model/default-option");
const bot = new grammy_1.Bot(""); // <-- 把你的 bot token 放在 "" 之间
// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时，grammY 将调用已注册的监听器。
// 处理 /start 命令。
bot.command("start", async (ctx) => {
    ctx.reply("Start 命令没什么用处，请探索机器人的其他神秘用法。");
});
// 处理其他的消息。
bot.on("message", (ctx) => {
    let message = ctx.message.text;
    let result = (0, typeset_1.typeset)(message, default_option_1.defaultOption);
    //   Process your logic after this line / 在这行之后处理你的逻辑
    if (result.length > 4000) {
        let hunk = result.length / 4000 + 1;
        let start = 0;
        let end = 4000;
        for (let i = 0; i < hunk; i++) {
            start = start * (i + 1);
            end = end * (i + 1);
            const segment = result.substring(start, end);
            ctx.api.sendMessage(-1001782968835, segment);
        }
    }
    else {
        ctx.api.sendMessage(-1001782968835, result);
    }
});
// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。
// 启动 bot。
bot.start();
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
});
