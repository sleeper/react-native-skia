import {
  TextAlign,
  TextDirection,
  TextHeightBehavior,
  DecorationStyle,
  FontStyle,
  TextBaseline,
} from "../../../skia/types";
import type {
  ParagraphStyle,
  SkSpan,
  Skia,
  TextStyle,
  SkParagraphBuilder,
} from "../../../skia/types";
import type {
  DrawingContext,
  SpanProps,
  TextProps,
  TextStyleProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import { enumKey } from "../datatypes";

const textStyleFromProps = (Skia: Skia, props: TextStyleProps) => {
  const {
    decoration,
    decorationThickness,
    fontFamilies,
    fontFeatures,
    fontSize,
    fontVariations,
    heightMultiplier,
    halfLeading,
    letterSpacing,
    locale,
    shadows,
    wordSpacing,
    backgroundColor,
    color,
    decorationColor,
    foregroundColor,
    decorationStyle,
    fontStyle,
    textBaseline,
  } = props;
  const style: TextStyle = {
    decoration,
    decorationThickness,
    fontFamilies,
    fontFeatures,
    fontSize,
    fontVariations,
    heightMultiplier,
    halfLeading,
    letterSpacing,
    locale,
    shadows,
    wordSpacing,
  };
  if (backgroundColor !== undefined) {
    style.backgroundColor = Skia.Color(backgroundColor);
  }
  if (color !== undefined) {
    style.color = Skia.Color(color);
  }
  if (decorationColor !== undefined) {
    style.decorationColor = Skia.Color(decorationColor);
  }
  if (foregroundColor !== undefined) {
    style.foregroundColor = Skia.Color(foregroundColor);
  }
  if (decorationStyle !== undefined) {
    style.decorationStyle = DecorationStyle[enumKey(decorationStyle)];
  }
  if (fontStyle !== undefined) {
    style.fontStyle = FontStyle[enumKey(fontStyle)];
  }
  if (textBaseline !== undefined) {
    style.textBaseline = TextBaseline[enumKey(textBaseline)];
  }
  return style;
};

const processSpans = (builder: SkParagraphBuilder, spans: SkSpan[]) => {
  for (const span of spans) {
    const { text, children } = span;
    if (text) {
      builder.addText(text);
    } else if (children) {
      processSpans(builder, children);
    }
  }
};

export class TextNode extends JsiDrawingNode<TextProps, ParagraphStyle> {
  constructor(ctx: NodeContext, props: TextProps) {
    super(ctx, NodeType.Text, props);
  }

  protected deriveProps() {
    const {
      disableHinting,
      ellipsis,
      heightMultiplier,
      maxLines,
      strutStyle,
      textAlign,
      textDirection,
      textHeightBehavior,
    } = this.props;
    const style: ParagraphStyle = {
      disableHinting,
      ellipsis,
      heightMultiplier,
      maxLines,
      strutStyle,
      textStyle: textStyleFromProps(this.Skia, this.props),
    };
    if (textAlign !== undefined) {
      style.textAlign = TextAlign[enumKey(textAlign)];
    }
    if (textDirection !== undefined) {
      style.textDirection = TextDirection[enumKey(textDirection)];
    }
    if (textHeightBehavior !== undefined) {
      style.textHeightBehavior =
        TextHeightBehavior[enumKey(textHeightBehavior)];
    }

    return style;
  }

  draw({ typefaceProvider, canvas }: DrawingContext) {
    if (!this.derived) {
      throw new Error("TextNode: paragraph style is undefined");
    }
    const { x, y, width } = this.props;
    // TODO: update styles to match the current opacity
    const builder = this.Skia.ParagraphBuilder.MakeFromFontProvider(
      this.derived,
      typefaceProvider
    );
    const spans = this.children()
      .filter(
        (child): child is JsiDeclarationNode<unknown, SkSpan> =>
          child instanceof JsiDeclarationNode && child.isSpan()
      )
      .map((child) => child.materialize());
    processSpans(builder, spans);
    const paragraph = builder.build();
    paragraph.layout(width);
    canvas.drawParagraph(paragraph, x, y);
  }
}

export class SpanNode extends JsiDeclarationNode<SpanProps, SkSpan> {
  constructor(ctx: NodeContext, props: SpanProps) {
    super(ctx, DeclarationType.Span, NodeType.Span, props);
  }

  materialize() {
    const { text, foregroundPaint, backgroundPaint } = this.props;
    const children = this.children()
      .filter(
        (child): child is JsiDeclarationNode<unknown, SkSpan> =>
          child instanceof JsiDeclarationNode && child.isSpan()
      )
      .map((child) => child.materialize());
    return {
      text,
      foregroundPaint,
      backgroundPaint,
      children,
    };
  }
}
