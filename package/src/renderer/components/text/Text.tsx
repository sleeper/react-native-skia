import React from "react";

import type { ChildrenProps, SpanProps, TextProps } from "../../../dom/types";
import type { SkiaProps } from "../../processors";

export const Text = (props: SkiaProps<TextProps>) => {
  return <skText {...props} />;
};

export const Span = (props: SkiaProps<SpanProps> & ChildrenProps) => {
  return <skSpan {...props} />;
};
