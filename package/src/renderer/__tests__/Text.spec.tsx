import React from "react";

import { processResult } from "../../__tests__/setup";
import { Text, Span, Group, Fill } from "../components";

import { drawOnNode, width } from "./setup";

describe("Text", () => {
  it("Simple Text", () => {
    const surface = drawOnNode(
      <Group>
        <Fill color="white" />
        <Text
          x={0}
          y={0}
          width={width}
          fontFamilies={["Roboto"]}
          fontSize={256}
        >
          Hello <Span color="blue">World</Span>
        </Text>
      </Group>
    );
    processResult(surface, "snapshots/drawings/simple-text.png", true);
  });
});
