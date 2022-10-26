import type { JsiSkCanvas } from "../web/JsiSkCanvas";
import { resolveFile } from "../../renderer/__tests__/setup";
import { processResult } from "../../__tests__/setup";

import { setupSkia } from "./setup";

describe("Paragraph", () => {
  it("should display the paragraph layout properly", async () => {
    const { surface, canvas: rnCanvas } = setupSkia();
    const canvas = rnCanvas as JsiSkCanvas;
    const roboto = resolveFile("skia/__tests__/assets/Roboto-Regular.ttf");
    const noto = resolveFile("skia/__tests__/assets/NotoColorEmoji.ttf");
    const fontMgr = CanvasKit.FontMgr.FromData(roboto, noto)!;
    expect(fontMgr).not.toBeNull();
    expect(fontMgr.countFamilies()).toBe(2);
    const paraStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.BLACK,
        fontFamilies: ["Roboto", "Noto Color Emoji"],
        fontSize: 50,
      },
      textAlign: CanvasKit.TextAlign.Left,
      maxLines: 7,
      ellipsis: "...",
    });
    const str = "The quick brown fox";
    const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr);
    builder.addText(str);
    const paragraph = builder.build();
    expect(paragraph.getHeight()).not.toBe(0);
    canvas.ref.drawParagraph(paragraph, 0, 0);
    processResult(surface, "snapshots/drawings/paragraph.png", true);
  });
});
