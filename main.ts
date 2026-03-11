import { Bot, GrammyError, HttpError, type Context } from "grammy";
import { typesetForTelegram } from "typeseter/src/bot";

const token = "";
const targetChatId = -1001782968835;
const chunkLimit = 3820;

const bot = new Bot(token);

// 按固定长度分片，避免超长消息发送失败。
function splitByLimit(text: string, limit: number): string[] {
  if (text.length <= limit) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + limit, text.length);
    chunks.push(text.substring(start, end));
    start = end;
  }

  return chunks;
}

// HTML 模式发送前转义文本，避免内容中的符号破坏标签结构。
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 将排版结果分片并包裹可折叠引用后，逐条转发到目标群组。
async function forwardTypesetResult(ctx: Context, result: string): Promise<void> {
  const segments = splitByLimit(result, chunkLimit);

  for (const segment of segments) {
    const message = `<blockquote expandable>${escapeHtml(segment)}</blockquote>`;
    await ctx.api
      .sendMessage(targetChatId, message, { parse_mode: "HTML" })
      .catch((sendErr) => {
        console.error("发送消息出错:", sendErr);
      });
  }
}

bot.command("start", async (ctx) => {
  await ctx.reply("已启动：收到文本后会排版并转发到目标群组。");
});

// 处理文本消息：排版 -> 分片 -> 折叠引用转发。
bot.on("message:text", async (ctx) => {
  const source = ctx.message.text;
  const res = typesetForTelegram({ text: source, mode: "plain" });

  if (!res.ok) {
    console.error("排版失败:", res.error);
    return;
  }

  await forwardTypesetResult(ctx, res.output);
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