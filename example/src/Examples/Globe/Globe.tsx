import React from "react";
import { View } from "react-native";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  Skia,
  useClockValue,
  useComputedValue,
  useImage,
  useTouchHandler,
  useValue,
  runDecay,
} from "@shopify/react-native-skia";

import { frag, Three } from "./ShaderLib";

// shader toy: https://www.shadertoy.com/view/fdlGWX
// https://www.shadertoy.com/view/XsB3Rm
const source = frag`
uniform shader image;
uniform float iTime;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float2 iMouse;


${Three}

half4 main(vec2 fragCoord) {
	// default ray dir
	vec3 dir = ray_dir(45.0, iResolution.xy, fragCoord.xy);
	// default ray origin
	vec3 eye = vec3(0.0, 0.0, 3);
	// rotate camera
	mat3 rot = rotationXY((iMouse.xy - iResolution.xy * 0.5).yx * vec2( 0.01, -0.01 ));
	dir = rot * dir;
	eye = rot * eye;
	// ray marching
  float depth = clip_far;
  vec3 n = vec3(0.0);
	if (!ray_marching(eye, dir, depth, n)) {
		return vec4(0, 0, 0, 1);
	}
	// shading
	vec3 pos = eye + dir * depth;  
  vec3 color = shading(pos, n, dir, eye);
	return vec4(n, 1.0);
}
`;

const arcColorStart = "#7629ed";
const arcColorEnd = "#CB6BED";
const arcsData = [
  {
    start: {
      lat: 29.85587,
      long: -95.4136,
    },
    end: {
      lat: 34.05648,
      long: -115.29487,
    },
  },
];

export const Globe = () => {
  const size = 375;
  const x = useValue(size / 2);
  const y = useValue(size / 2);
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const onTouch = useTouchHandler({
    onStart: (pos) => {
      offsetX.current = x.current - pos.x;
      offsetY.current = y.current - pos.y;
    },
    onActive: (pos) => {
      x.current = offsetX.current + pos.x;
      y.current = offsetY.current + pos.y;
    },
    onEnd: ({ velocityX, velocityY }) => {
      runDecay(x, { velocity: velocityX });
      runDecay(y, { velocity: velocityY });
    },
  });

  const earth = useImage(require("./assets/earth.jpg"));
  const clock = useClockValue();
  const uniforms = useComputedValue(() => {
    return {
      iTime: clock.current * 0.03,
      iResolution: [size, size],
      iImageResolution: [earth?.width() ?? 0, earth?.height() ?? 0],
      iMouse: [x.current, y.current],
    };
  }, [clock, earth]);

  if (!earth) {
    return null;
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Canvas
        style={{
          width: size,
          height: size,
        }}
        onTouch={onTouch}
      >
        <Fill>
          <Shader source={source} uniforms={uniforms}>
            <ImageShader image={earth} tx="repeat" ty="repeat" />
          </Shader>
        </Fill>
      </Canvas>
    </View>
  );
};
