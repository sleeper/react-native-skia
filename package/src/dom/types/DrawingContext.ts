import type {
  SkCanvas,
  SkPaint,
  SkTypefaceFontProvider,
} from "../../skia/types";

export interface DrawingContext {
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
  typefaceProvider: SkTypefaceFontProvider;
}
