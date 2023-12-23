"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flow = void 0;
const default_option_1 = require("../model/default-option");
const punctuation_1 = require("./punctuation");
const optional_1 = require("./optional");
class Flow {
    /**
     * 构造器，兼预处理。
     * 此函数（构造器）功能：
     * 1. 将文本以换行符为界分割成段落（paragraphs 数组）；
     * 2. 去除每段首尾的空白字符（半角空格、全角空格、制表符等）；
     *
     * @param text 传入的原始文本字符串
     */
    constructor(text) {
        /**
         * 段落数组
         * 采取数组形式便于对每段进行操作
         * 按文章操作逻辑复杂，不方便
         */
        this.paragraphs = [];
        this.paragraphs = text
            .split("\n")
            .map((paragraph) => paragraph.trim() || null);
    }
    /**
     * 删除空白行的函数。
     *
     * @param bool 是否删除空白行
     * @returns 如果不删除，直接返回
     */
    deleteBlankLines(bool) {
        if (bool)
            this.paragraphs = this.paragraphs.filter((str) => str !== null);
        return this;
    }
    /**
     * 添加缩进的函数。
     * 此函数目前只能添加两个全角空格缩进：“　　”
     *
     * @param bool 是否添加缩进
     * @returns 如果不添加缩进，直接返回
     */
    insertIndent(bool) {
        if (bool)
            this.paragraphs = this.paragraphs.map((s) => s?.replace(/^/, "　　"));
        return this;
    }
    /**
     * 删除中文之间空白字符的函数。
     *
     * @param bool 是否删除中文之间的空白字符
     * @returns 如果不删除，直接返回
     */
    deleteSpaceInChineseCharacter(bool) {
        if (bool)
            this.paragraphs = this.paragraphs.map((s) => 
            // 注意：此处正则表达式使用了零宽断言，属于高级语法
            s?.replaceAll(/(?<=\p{Script=Han})\s+(?=\p{Script=Han})/gu, ""));
        return this;
    }
    /**
     * 删除中文汉字与中文标点之间空白字符的函数。
     *
     * @param bool 是否删除中文汉字与中文标点之间的空白字符
     * @returns 如果不删除，直接返回
     */
    deleteSpaceBetweenChineseCharactersAndChinesePunctuations(bool) {
        if (bool)
            this.paragraphs = this.paragraphs.map((s) => 
            // 注意：此处正则表达式使用了零宽断言，属于高级语法
            s?.replaceAll(/(?<=\p{Script=Han})\s+(?=[，。；‘’【】（）￥《》：“”…！？、~～·])|(?<=[，。；‘’【】（）￥《》：“”…！？、~～·])\s+(?=\p{Script=Han})/gu, ""));
        return this;
    }
    /**
     * 在中英文之间插入半角空格的函数。
     *
     * @param bool 是否在中英文之间插入半角空格（ ）
     * @returns 如果不插入，直接返回
     */
    insertSpaceInChineseAndEnglish(bool) {
        if (bool)
            this.paragraphs = this.paragraphs.map((s) => s?.replaceAll(
            // 注意：此处正则表达式使用了零宽断言，属于高级语法
            // 或符号（|）之前的部分，匹配前面中文后面英文的形式（中文English）
            // 或符号（|）之后的部分，匹配前面英文后面中文的形式（English中文）
            /(?<=\p{Script=Han})(?=[\w])|(?<=[\w])(?=\p{Script=Han})/gu, " "));
        return this;
    }
    fixPunctuation(bool) {
        if (bool) {
            let p = this.paragraphs;
            p = (0, punctuation_1.comma)(default_option_1.defaultOption.comma, p);
            // 注意：多个句点变为省略号，和，句点修正，之间的顺序不能颠倒
            p = (0, punctuation_1.dots2ellipsis)(default_option_1.defaultOption.dots2ellipsis, p);
            p = (0, punctuation_1.dot)(default_option_1.defaultOption.dot, p);
            p = (0, punctuation_1.colon)(default_option_1.defaultOption.colon, p);
            p = (0, punctuation_1.questionMark)(default_option_1.defaultOption.questionMark, p);
            p = (0, punctuation_1.bang)(default_option_1.defaultOption.bang, p);
            p = (0, punctuation_1.semicolon)(default_option_1.defaultOption.semicolon, p);
            p = (0, punctuation_1.guillemet)(default_option_1.defaultOption.guillemet, p);
            p = (0, punctuation_1.chineseDash)(default_option_1.defaultOption.chineseDash, p);
            p = (0, punctuation_1.chineseCommasFold)(default_option_1.defaultOption.chineseCommasFold, p);
            p = (0, punctuation_1.chineseDotsFold)(default_option_1.defaultOption.chineseDotsFold, p);
            p = (0, punctuation_1.chineseEllipsisesFold)(default_option_1.defaultOption.chineseEllipsisesFold, p);
            p = (0, punctuation_1.englishBrackets2ChineseBrackets)(default_option_1.defaultOption.englishBrackets2ChineseBrackets, p);
            this.paragraphs = p;
        }
        return this;
    }
    fixOthers(bool) {
        if (bool) {
            let p = this.paragraphs;
            p = (0, optional_1.insertSpaceAfterPercentSign)(default_option_1.defaultOption.insertSpaceAfterPercentSign, p);
            this.paragraphs = p;
        }
        return this;
    }
    /**
     * 每段之间添加空行。
     * 负责：不添加空行、添加一个空行、添加两个空行，
     * 考虑后续更改为自定义空行数量。
     *
     * @param number 每段之间添加空行的数量，枚举类型
     */
    insertLineGap(number) {
        if (number !== 0) {
            const p = this.paragraphs;
            this.paragraphs = p.flatMap((item, index) => {
                return index === p.length - 1
                    ? item
                    : [item, ...new Array(number === 1 ? 1 : 2).fill("")];
            });
        }
        return this;
    }
    /**
     * 处理完成的函数。
     * 此函数只能在处理流程的最后被调用。
     *
     * @returns 处理完成的文本内容
     */
    done() {
        return this.paragraphs.join("\n");
    }
}
exports.Flow = Flow;
