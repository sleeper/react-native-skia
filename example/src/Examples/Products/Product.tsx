/* eslint-disable max-len */
import {
  BackdropBlur,
  Canvas,
  Fill,
  fitbox,
  Group,
  Image,
  Paint,
  Path,
  processTransform2d,
  Rect,
  rect,
  RoundedRect,
  rrect,
  Skia,
  useImage,
} from "@shopify/react-native-skia";
import React from "react";

const d =
  "M311.927 171.204L170.506 312.626L29.0842 171.204C10.3306 152.451 -0.205078 127.015 -0.205078 100.494C-0.205078 73.972 10.3306 48.5366 29.0842 29.783C47.8379 11.0293 73.2733 0.493674 99.7949 0.493674C126.317 0.493674 151.752 11.0293 170.506 29.783C189.259 11.0293 214.695 0.493652 241.216 0.493652C267.738 0.493652 293.173 11.0293 311.927 29.783C330.681 48.5366 341.216 73.972 341.216 100.494C341.216 127.015 330.681 152.451 311.927 171.204Z";

const r = 25;
const heart = Skia.Path.MakeFromSVGString(d)!;
const bounds = heart.computeTightBounds();
const pad = 12;
const m3 = processTransform2d(
  fitbox("contain", bounds, rect(pad, pad, 2 * r - 2 * pad, 2 * r - 2 * pad))
);
heart.transform(m3);

const circle = Skia.Path.Make();
circle.addCircle(r, r, r);

interface ProductProps {
  url: string;
  width: number;
  height: number;
}

export const Product = ({ url, width, height }: ProductProps) => {
  const image = useImage(url);
  const rct = rrect(rect(0, 0, width, 1.2 * width), 5, 5);
  if (image == null) {
    return null;
  }
  return (
    <Canvas style={{ width, height }}>
      <RoundedRect rect={rct} color="#F3F3F3">
        <Paint style="stroke" strokeWidth={1} color="#E7E7E7" />
      </RoundedRect>
      <Image
        clip={rct}
        image={image}
        x={0}
        y={0}
        width={width}
        height={1.2 * width}
        fit="cover"
      />
      <Rect rect={rect(0, 1.2 * width + 10, 0.9 * width, 15)} color="#F3F3F3" />
      <Rect rect={rect(0, 1.2 * width + 35, 0.6 * width, 15)} color="#F3F3F3" />
      <Rect rect={rect(0, 1.2 * width + 60, 0.4 * width, 15)} color="#F3F3F3" />
      <Group transform={[{ translateX: width - 2 * r - 5 }, { translateY: 5 }]}>
        <BackdropBlur blur={4} clip={circle}>
          <Fill color="rgba(255, 255, 255, 0.3)" />
          <Path
            path={heart}
            color="white"
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            strokeJoin="round"
          />
        </BackdropBlur>
      </Group>
    </Canvas>
  );
};
