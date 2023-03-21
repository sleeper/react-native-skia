import {
  BlurMask,
  center,
  Circle,
  CornerPathEffect,
  DiscretePathEffect,
  DisplacementMap,
  Fill,
  Group,
  Oval,
  Path,
  rect,
  Skia,
  Turbulence,
  vec,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

export const Limmat = () => {
  const { height, width } = useWindowDimensions();

  const path = Skia.Path.Make();
  path.addRect(rect(125, height * 0.5, 200, 600));
  const pivot = center(path.computeTightBounds());
  const m3 = Skia.Matrix();
  m3.translate(pivot.x, pivot.y);
  m3.rotate(-Math.PI / 6);
  m3.translate(-pivot.x, -pivot.y);
  path.transform(m3);

  const limmat = rect(-500, height * 0.6, 1000, 500);
  const clip = Skia.Path.Make();
  clip.addOval(limmat);
  return (
    <>
      <Oval rect={rect(0, height * 0.5, 1000, 500)} color="#1D4D68" />
      <Oval rect={limmat} color="#277A93" />
      <Group clip={clip}>
        <Path path={path} color="#3084A6">
          <CornerPathEffect r={75} />
          <DiscretePathEffect length={50} deviation={75} />
        </Path>
        <Circle
          color="#F9E3A4"
          opacity={0.2}
          r={150}
          c={vec(width / 2, height - 300)}
        >
          <DisplacementMap channelX="r" channelY="g" scale={50}>
            <Turbulence freqX={0.005} freqY={0.1} octaves={4} />
          </DisplacementMap>
        </Circle>
      </Group>
    </>
  );
};
