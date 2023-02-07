import {
  Canvas,
  Circle,
  Fill,
  Image,
  ImageShader,
  Shader,
  Skia,
  useClockValue,
  useComputedValue,
  useImage,
  useTouchHandler,
  vec,
  useValue,
} from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float iTime;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float r;
uniform float2 iMouse;
const float pi = 3.14;


half4 main(float2 fragCoord) {
  vec2 coord = fragCoord/iResolution.xx;
  vec2 uv = ((coord - vec2(0.5, 0.5)) * vec2(2.0, 2.0));
  float r = length(uv);

  if (r > 1.0)
  {
      return vec4(0, 0, 0, 1);
  }
  else
  {
      float phi = atan(uv.y, uv.x);
      float theta = r * phi;
      vec2 sphereCoords = vec2(phi / (2.0 * pi), theta / pi);
      return image.eval(sphereCoords * iImageResolution);
  }
}`)!;

export const Globe = () => {
  const clock = useClockValue();
  const { width, height } = useWindowDimensions();
  const center = vec(width / 2, height / 2);
  const touch = useValue({ x: 0, y: 0 });
  const onTouch = useTouchHandler({
    onActive: (e) => {
      touch.current.x = e.x;
      touch.current.y = e.y;
    },
  });
  const bg = useImage(
    require("./assets/SPACE-BG-smaller-extend-down-tiny.png")
  );
  const earth = useImage(require("./assets/earth.jpg"));
  const uniforms = useComputedValue(() => {
    return {
      iTime: (clock.current * 60) / 1000,
      iResolution: [width, height],
      iImageResolution: [width, height], //[earth?.width() ?? 0, earth?.height() ?? 0],
      r: center.x - 32,
      iMouse: touch.current,
    };
  }, [clock, earth]);
  if (!bg || !earth) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch}>
      <Image image={bg} x={0} y={0} width={width} height={height} fit="cover" />
      {/* <Circle c={center} r={center.x - 32}> */}
      <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader
            image={earth}
            fit="cover"
            x={0}
            y={0}
            tx="repeat"
            ty="repeat"
            width={width}
            height={height}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
