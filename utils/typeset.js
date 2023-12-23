"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeset = void 0;
const flow_1 = require("./flow");
const typeset = (text, o) => {
    const flow = new flow_1.Flow(text);
    flow
        .deleteBlankLines(o.deleteBlankLines)
        .deleteSpaceBetweenChineseCharactersAndChinesePunctuations(o.deleteSpaceBetweenChineseCharactersAndChinesePunctuations)
        .deleteSpaceInChineseCharacter(o.deleteSpaceInChineseCharacter)
        .insertIndent(o.insertIndent)
        // 标点修正比较多，归为一个函数
        .fixPunctuation(o.fixPunctuation)
        // 继续流程
        .insertSpaceInChineseAndEnglish(o.insertSpaceInChineseAndEnglish)
        .insertLineGap(o.lineGap)
        // 其他可选修正
        .fixOthers(o.fixOthers);
    return flow.done();
};
exports.typeset = typeset;
