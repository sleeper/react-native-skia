import type { RefObject } from "react";

import type { DrawingInfo, SkiaView } from "../views";
import type { Skia, Vector } from "../skia/types";
import type { DrawingContext as SkiaDOMDrawingContext } from "../dom/types";

export interface DrawingContext
  extends Omit<DrawingInfo, "touches">,
    SkiaDOMDrawingContext {
  center: Vector;
  ref: RefObject<SkiaView>;
  Skia: Skia;
}
