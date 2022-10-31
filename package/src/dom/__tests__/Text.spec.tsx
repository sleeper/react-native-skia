import { getSkDOM, resolveFile } from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";

const roboto = resolveFile("skia/__tests__/assets/Roboto-Regular.ttf");
const noto = resolveFile("skia/__tests__/assets/NotoColorEmoji.ttf");

describe("Paragraph", () => {
  it("should display the paragraph layout properly using the typeface provider", async () => {
    const { surface, ctx, width } = setupSkia();
    const Sk = getSkDOM();
    expect(roboto).toBeDefined();
    expect(noto).toBeDefined();
    ctx.typefaceProvider.registerFont(roboto, "Roboto");
    ctx.typefaceProvider.registerFont(noto, "Noto Color Emoji");
    const root = Sk.Text({
      x: 0,
      y: 0,
      width,
      color: "black",
      fontFamilies: ["Roboto", "Noto Color Emoji"],
      fontSize: 35,
      textAlign: "left",
      maxLines: 4,
      ellipsis: "...",
    });
    root.addChild(
      Sk.Span({
        text: "The quick brown fox 🦊 ate a zesty hamburgerfons 🍔.\nThe 👩‍👩‍👧‍👧 laughed.",
      })
    );
    root.render(ctx);
    processResult(surface, "snapshots/drawings/paragraph.png");
  });
});
