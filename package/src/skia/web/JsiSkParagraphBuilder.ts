import type {
  CanvasKit,
  ParagraphBuilder,
  TextStyle as CKTextStyle,
} from "canvaskit-wasm";

import type { SkPaint } from "../types";
import type {
  PlaceholderAlignment,
  TextBaseline,
  TextStyle,
} from "../types/Paragraph";
import type { SkParagraphBuilder } from "../types/Paragraph/ParagraphBuilder";

import { ckEnum, HostObject, optEnum } from "./Host";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkParagraph } from "./JsiSkParagraph";

export const textStyle = (style: TextStyle) => {
  const styleCopy = { ...style } as CKTextStyle;
  if (style.textBaseline !== undefined) {
    styleCopy.textBaseline = ckEnum(style.textBaseline);
  }
  if (style.decorationStyle !== undefined) {
    styleCopy.decorationStyle = ckEnum(style.decorationStyle);
  }
  return styleCopy;
};

export class JsiSkParagraphBuilder
  extends HostObject<ParagraphBuilder, "ParagraphBuilder">
  implements SkParagraphBuilder
{
  constructor(CanvasKit: CanvasKit, ref: ParagraphBuilder) {
    super(CanvasKit, ref, "ParagraphBuilder");
  }

  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number
  ) {
    this.ref.addPlaceholder(
      width,
      height,
      optEnum(alignment),
      optEnum(baseline),
      offset
    );
  }

  addText(str: string) {
    this.ref.addText(str);
  }

  build() {
    const p = this.ref.build();
    return new JsiSkParagraph(this.CanvasKit, p);
  }

  pop() {
    this.ref.pop();
  }

  pushStyle(text: TextStyle) {
    this.ref.pushStyle(new this.CanvasKit.TextStyle(textStyle(text)));
  }

  pushPaintStyle(ts: TextStyle, fg: SkPaint, bg: SkPaint) {
    this.ref.pushPaintStyle(
      textStyle(ts),
      JsiSkPaint.fromValue(fg),
      JsiSkPaint.fromValue(bg)
    );
  }

  reset() {
    this.ref.reset();
  }
}
