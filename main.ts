import { Bot, GrammyError, HttpError, type Context } from "grammy";
import {
  chatKey,
  createTelegramChatCfgStore,
  createTelegramHandler,
  type BotMode,
  type TelegramMeta,
} from "typeseter/src/bot";

const token = "";

const defaultMode: BotMode = "plain";

const bot = new Bot(token);

const store = createTelegramChatCfgStore({
  maxEntries: 5000,
  ttlMs: 30 * 24 * 60 * 60 * 1000,
});

// 统一封装“排版后发送”，内部已处理超长文本自动分片。
const handleTypeset = createTelegramHandler(async (meta, text) => {
  if (meta?.chatId == null) {
    return;
  }
  await bot.api.sendMessage(meta.chatId, text);
});

// 将 grammy 上下文转换为 Typeseter 所需的消息元数据。
function toMeta(ctx: Context): TelegramMeta {
  return {
    chatId: ctx.chat?.id,
    userId: ctx.from?.id,
    messageId: ctx.msg?.message_id,
  };
}

// 保存当前会话模式（plain / markdown），用于后续消息复用。
function setMode(meta: TelegramMeta, mode: BotMode): void {
  const key = chatKey(meta);
  if (!key) {
    return;
  }

  const current = store.get(key);
  store.set(key, {
    mode,
    preview: current?.preview ?? false,
    opt: current?.opt,
    updatedAt: Date.now(),
  });
}

bot.command("start", async (ctx) => {
  await ctx.reply(
    [
      "中文排版机器人已启动。",
      "发送任意文本会自动排版并回发。",
      "命令：/plain 切换纯文本，/markdown 切换 Markdown。",
    ].join("\n")
  );
});

bot.command("plain", async (ctx) => {
  setMode(toMeta(ctx), "plain");
  await ctx.reply("已切换为 plain 模式。");
});

bot.command("markdown", async (ctx) => {
  setMode(toMeta(ctx), "markdown");
  await ctx.reply("已切换为 markdown 模式。");
});

// 文本消息主流程：读取会话配置 -> 排版 -> 回发 -> 更新会话状态。
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  // 避免将命令本身再做一次排版回发。
  if (!text || text.startsWith("/")) {
    return;
  }

  const meta = toMeta(ctx);
  const key = chatKey(meta);
  const cfg = key ? store.get(key) : undefined;

  const res = await handleTypeset({
    text,
    mode: cfg?.mode ?? defaultMode,
    preview: cfg?.preview ?? false,
    opt: cfg?.opt,
    meta,
  });

  if (key) {
    store.set(key, {
      mode: res.usedMode,
      preview: false,
      opt: res.ok ? res.usedOpt : cfg?.opt,
      updatedAt: Date.now(),
    });
  }
});

bot.start();
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});