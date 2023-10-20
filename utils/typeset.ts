import { Option } from "../model/option";
import { Flow } from "./flow";

const typeset = (text: string, o: Option): string => {
  const flow = new Flow(text);
  flow
    .deleteBlankLines(o.deleteBlankLines)
    .deleteSpaceBetweenChineseCharactersAndChinesePunctuations(
      o.deleteSpaceBetweenChineseCharactersAndChinesePunctuations
    )
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

export { typeset };