import type { SkSpan } from "../../../skia";
import type { DrawingContext, SpanProps, TextProps } from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";

export class TextNode extends JsiDrawingNode<TextProps, null> {
  constructor(ctx: NodeContext, props: TextProps) {
    super(ctx, NodeType.Text, props);
  }

  protected deriveProps() {
    return null;
  }

  draw({}: DrawingContext) {
    const { x, y } = this.props;
    console.log({ x, y });
  }
}

export class SpanNode extends JsiDeclarationNode<SpanProps, SkSpan> {
  constructor(ctx: NodeContext, props: SpanProps) {
    super(ctx, DeclarationType.Span, NodeType.Span, props);
  }

  materialize() {
    return {
      text: "hello",
    };
  }
}
