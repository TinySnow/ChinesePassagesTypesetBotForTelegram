import { Bot, GrammyError, HttpError, type Context } from "grammy";
import {
  normalizeChunkLen,
  splitTelegramText,
  typesetForTelegram,
  createTelegramChatCfgStore,
  chatKey,
} from "typeseter/src/bot";
import type { TelegramChatCfg, BotMode, TelegramMeta } from "typeseter/src/bot";
import type { Option } from "typeseter/src/core/models/option";
import { defaultSettings } from "typeseter/src/core/models/default-setting";
import { SocksProxyAgent } from "socks-proxy-agent";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not set");
}

const bot = new Bot(token, {
  client: {
    baseFetchConfig: {
      agent: new SocksProxyAgent("socks5h://127.0.0.1:7890"),
    },
  },
});

const targetChatId = -1001782968835;
const chunkLimit = normalizeChunkLen(3820);
const cfgStore = createTelegramChatCfgStore();

// ---------- 选项映射表 ----------

type BoolKey = {
  [K in keyof Option]: Option[K] extends boolean ? K : never;
}[keyof Option];

type GroupLabel = "common" | "punctuation" | "other" | "md";

const GROUP_ORDER: GroupLabel[] = ["common", "punctuation", "other", "md"];

const GROUP_LABELS: Record<GroupLabel, string> = {
  common: "常规修正",
  punctuation: "标点修正",
  other: "其他修正",
  md: "MD 专属",
};

const KEY_LABELS: Record<keyof Option, string> = {
  insertIndent: "插入段首缩进",
  deleteBlankLines: "删除原始空行",
  preserveBlankLines: "维持空行不变（诗歌等）",
  deleteSpaceBetweenChineseCharactersAndChinesePunctuations: "删除汉字和标点之间空格",
  deleteSpaceInChineseCharacter: "删除汉字之间空格",
  insertSpaceInChineseAndEnglish: "中英文之间插入空格",
  fixPunctuation: "标点修正总开关",
  comma: "逗号（英转中）",
  dots2ellipsis: "连续句点变省略号",
  dot: "句点（英转中）",
  colon: "冒号（英转中）",
  bang: "叹号（英转中）",
  questionMark: "问号（英转中）",
  semicolon: "分号（英转中）",
  enQuotes2CnQuotes: "引号（英转中）",
  guillemet: "书名号修正",
  chineseDash: "破折号修正",
  chineseCommasFold: "删除重复逗号",
  chineseDotsFold: "删除重复句号",
  chineseEllipsisesFold: "删除重复省略号",
  englishBrackets2ChineseBrackets: "括号（英转中）",
  fixOthers: "其他修正总开关",
  insertSpaceAfterPercentSign: "百分号后加空格",
  noIndentFirstLine: "首行不缩进（如标题）",
  mdIndentParagraphs: "md 段首缩进",
  mdStyleSpacing: "md 样式两侧加空格",
  mdAutoBlankLines: "md 段落自动空行",
  mdTrimTrailingSpaces: "md 删除行尾空白",
  mdHeadingSpaceAfterHash: "md 标题井号后补空格",
  mdHeadingSingleSpaceAfterHash: "md 标题井号后空格归一化",
  mdBlankLineAroundHeadings: "md 标题前后补空行",
  mdListMarkerSpace: "md 列表标记后空格归一化",
  mdBlankLineAroundFences: "md 代码块前后补空行",
  mdBlankLineAroundLists: "md 列表前后补空行",
  mdEnsureSingleTrailingNewline: "md 文件末尾保证单个换行",
  mdCollapseBlankLines: "md 缩减连续空行（br 保留语义）",
  lineGap: "段落间距",
  customedLineBreaker: "自定义分隔符",
};

const KEY_GROUPS: Record<keyof Option, GroupLabel> = {
  insertIndent: "common",
  deleteBlankLines: "common",
  preserveBlankLines: "common",
  deleteSpaceBetweenChineseCharactersAndChinesePunctuations: "common",
  deleteSpaceInChineseCharacter: "common",
  insertSpaceInChineseAndEnglish: "common",
  fixPunctuation: "punctuation",
  comma: "punctuation",
  dots2ellipsis: "punctuation",
  dot: "punctuation",
  colon: "punctuation",
  bang: "punctuation",
  questionMark: "punctuation",
  semicolon: "punctuation",
  enQuotes2CnQuotes: "punctuation",
  guillemet: "punctuation",
  chineseDash: "punctuation",
  chineseCommasFold: "punctuation",
  chineseDotsFold: "punctuation",
  chineseEllipsisesFold: "punctuation",
  englishBrackets2ChineseBrackets: "punctuation",
  fixOthers: "other",
  insertSpaceAfterPercentSign: "other",
  noIndentFirstLine: "other",
  mdIndentParagraphs: "md",
  mdStyleSpacing: "md",
  mdAutoBlankLines: "md",
  mdTrimTrailingSpaces: "md",
  mdHeadingSpaceAfterHash: "md",
  mdHeadingSingleSpaceAfterHash: "md",
  mdBlankLineAroundHeadings: "md",
  mdListMarkerSpace: "md",
  mdBlankLineAroundFences: "md",
  mdBlankLineAroundLists: "md",
  mdEnsureSingleTrailingNewline: "md",
  mdCollapseBlankLines: "md",
  lineGap: "other",
  customedLineBreaker: "other",
};

function isBoolKey(key: string): key is BoolKey {
  if (key === "lineGap" || key === "customedLineBreaker") return false;
  return key in KEY_LABELS;
}

// ---------- 配置存取 ----------

function getCfg(ctx: Context): TelegramChatCfg {
  const key = chatKey({ chatId: ctx.chat?.id });
  if (!key) return { opt: { ...defaultSettings }, updatedAt: Date.now() };
  return cfgStore.get(key) ?? { opt: { ...defaultSettings }, updatedAt: Date.now() };
}

function saveCfg(ctx: Context, cfg: TelegramChatCfg): void {
  const key = chatKey({ chatId: ctx.chat?.id });
  if (!key) return;
  cfgStore.set(key, { ...cfg, updatedAt: Date.now() });
}

function cfgOpt(cfg: TelegramChatCfg): Option {
  return { ...defaultSettings, ...(cfg.opt ?? {}) } as Option;
}

// ---------- 格式化 ----------

function statusIcon(on: boolean): string {
  return on ? "✅" : "⬜";
}

function formatSettings(cfg: TelegramChatCfg): string {
  const opt = cfgOpt(cfg);
  const mode = cfg.mode ?? "plain";
  const lines: string[] = [`模式：${mode === "markdown" ? "MD" : "纯文本"}`];

  for (const group of GROUP_ORDER) {
    const heading = GROUP_LABELS[group];
    const groupKeys = Object.keys(KEY_LABELS).filter(
      (k) => KEY_GROUPS[k as keyof Option] === group && isBoolKey(k)
    ) as (keyof Option)[];

    if (groupKeys.length === 0) continue;
    lines.push("");
    lines.push(`—— ${heading} ——`);

    for (const key of groupKeys) {
      const label = KEY_LABELS[key];
      const val = opt[key];
      const icon = typeof val === "boolean" ? statusIcon(val) : String(val);
      lines.push(`${icon}  ${label}`);
    }
  }

  return lines.join("\n");
}

// ---------- 排版核心 ----------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function forwardTypesetResult(ctx: Context, result: string): Promise<void> {
  const segments = splitTelegramText(result, chunkLimit);
  for (const segment of segments) {
    const message = `<blockquote expandable>${escapeHtml(segment)}</blockquote>`;
    await ctx.api
      .sendMessage(targetChatId, message, { parse_mode: "HTML" })
      .catch((sendErr) => {
        console.error("发送消息出错:", sendErr);
      });
  }
}

// ---------- 命令处理 ----------

bot.command("start", async (ctx) => {
  await ctx.reply(
    "排版机器人已启动。\n\n" +
      "命令列表：\n" +
      "/settings - 查看当前设置\n" +
      "/mode <plain|markdown> - 切换模式\n" +
      "/toggle <选项名> - 开关某个选项\n" +
      "/preset <poetry|default|strict> - 预设配置\n" +
      "/reset - 恢复默认设置\n\n" +
      "直接发送文本即可排版。"
  );
});

bot.command("settings", async (ctx) => {
  const cfg = getCfg(ctx);
  const text = formatSettings(cfg);
  await ctx.reply(`<pre>${escapeHtml(text)}</pre>`, { parse_mode: "HTML" });
});

bot.command("mode", async (ctx) => {
  const arg = ctx.match.trim().toLowerCase();
  const cfg = getCfg(ctx);

  if (arg === "plain" || arg === "markdown") {
    cfg.mode = arg as BotMode;
    saveCfg(ctx, cfg);
    await ctx.reply(`模式已切换为：${arg === "markdown" ? "MD 模式" : "纯文本模式"}`);
    return;
  }

  const current = cfg.mode ?? "plain";
  await ctx.reply(`当前模式：${current === "markdown" ? "MD 模式" : "纯文本模式"}\n用法：/mode plain 或 /mode markdown`);
});

bot.command("toggle", async (ctx) => {
  const raw = ctx.match.trim();
  if (!raw) {
    await ctx.reply("用法：/toggle <选项名>\n使用 /settings 查看所有可用选项名。");
    return;
  }

  const parts = raw.split(/\s+/);
  const key = parts[0];
  const force = parts[1]?.toLowerCase();

  if (!isBoolKey(key)) {
    await ctx.reply(`未知选项："${key}"。\n使用 /settings 查看所有可用选项。`);
    return;
  }

  const cfg = getCfg(ctx);
  const opt = cfgOpt(cfg);

  if (force === "on" || force === "off") {
    opt[key] = force === "on";
  } else {
    opt[key] = !opt[key];
  }

  cfg.opt = opt;
  saveCfg(ctx, cfg);

  const label = KEY_LABELS[key];
  const newVal = opt[key] ? "开启" : "关闭";
  await ctx.reply(`${label}：${newVal}`);
});

bot.command("reset", async (ctx) => {
  const cfg = getCfg(ctx);
  cfg.opt = { ...defaultSettings };
  cfg.mode = "plain";
  saveCfg(ctx, cfg);
  await ctx.reply("已恢复默认设置。");
});

bot.command("preset", async (ctx) => {
  const name = ctx.match.trim().toLowerCase();
  const cfg = getCfg(ctx);
  const opt = cfgOpt(cfg);

  if (name === "poetry") {
    opt.preserveBlankLines = true;
    opt.noIndentFirstLine = true;
    opt.deleteBlankLines = false;
    opt.lineGap = 0;
    opt.mdCollapseBlankLines = true;
    opt.mdAutoBlankLines = false;
    cfg.opt = opt;
    saveCfg(ctx, cfg);
    await ctx.reply("已应用「诗歌」预设：维持空行 + 首行不缩进 + md 缩减连续空行。");
    return;
  }

  if (name === "strict") {
    Object.assign(opt, { ...defaultSettings });
    // 全开：所有布尔选项设为 true
    for (const k of Object.keys(KEY_LABELS)) {
      if (isBoolKey(k)) opt[k] = true;
    }
    cfg.opt = opt;
    saveCfg(ctx, cfg);
    await ctx.reply("已应用「严格」预设：所有排版选项全部开启。");
    return;
  }

  if (name === "default" || name === "") {
    cfg.opt = { ...defaultSettings };
    saveCfg(ctx, cfg);
    await ctx.reply("已应用「默认」预设：恢复默认设置。");
    return;
  }

  await ctx.reply("可用预设：poetry（诗歌）、strict（严格全开）、default（默认）");
});

// ---------- 文本处理 ----------

bot.on("message:text", async (ctx) => {
  const source = ctx.message.text;

  if (source.startsWith("/")) {
    return;
  }

  const cfg = getCfg(ctx);
  const mode = cfg.mode ?? "plain";
  const opt = cfgOpt(cfg);

  const res = typesetForTelegram({ text: source, mode, opt });

  if (!res.ok) {
    console.error("排版失败:", res.error);
    await ctx.reply("排版失败，请检查日志。");
    return;
  }

  await forwardTypesetResult(ctx, res.output);
});

// ---------- 启动 ----------

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
