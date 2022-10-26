import type { JsiSkCanvas } from "../web/JsiSkCanvas";
import { resolveFile } from "../../renderer/__tests__/setup";
import { processResult } from "../../__tests__/setup";

import { setupSkia } from "./setup";

const roboto = resolveFile("skia/__tests__/assets/Roboto-Regular.ttf");
const noto = resolveFile("skia/__tests__/assets/NotoColorEmoji.ttf");

describe("Paragraph", () => {
  it("should display the paragraph layout properly using the typeface provider", async () => {
    const { surface, canvas: rnCanvas, width } = setupSkia();
    const canvas = rnCanvas as JsiSkCanvas;
    const fontSrc = CanvasKit.TypefaceFontProvider.Make();
    fontSrc.registerFont(roboto, "Roboto");
    fontSrc.registerFont(noto, "Noto Color Emoji");
    const paraStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.BLACK,
        fontFamilies: ["Roboto", "Noto Color Emoji"],
        fontSize: 35,
      },
      textAlign: CanvasKit.TextAlign.Left,
      maxLines: 4,
      ellipsis: "...",
    });
    const str =
      "The quick brown fox 🦊 ate a zesty hamburgerfons 🍔.\nThe 👩‍👩‍👧‍👧 laughed.";
    const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(
      paraStyle,
      fontSrc
    );
    builder.addText(str);
    const paragraph = builder.build();
    paragraph.layout(width);
    expect(paragraph.getHeight()).not.toBe(0);
    canvas.ref.drawParagraph(paragraph, 0, 0);
    processResult(surface, "snapshots/drawings/paragraph.png");
  });
});
