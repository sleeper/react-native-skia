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

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float iTime;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float2 iMouse;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float PRECISION = 0.001;
const float PI = 3.14159265359;

mat2 rotate(float theta) {
  float s = sin(theta), c = cos(theta);
  return mat2(c, -s, s, c);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdScene(vec3 p) {
  float entity = sdSphere(p, 1.0);
  entity = min(entity, sdSphere(p - vec3(-1.2, 0, 0), 0.2));
  return entity;
}

float rayMarch(vec3 ro, vec3 rd) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = ro + depth * rd;
    float d = sdScene(p);
    depth += d;
    if (d < PRECISION || depth > MAX_DIST) break;
  }
  return depth;
}

mat3 camera(vec3 cameraPos, vec3 lookAtPoint) {
	vec3 cd = normalize(lookAtPoint - cameraPos); // camera direction
	vec3 cr = normalize(cross(vec3(0, 1, 0), cd)); // camera right
	vec3 cu = normalize(cross(cd, cr)); // camera up
	return mat3(-cr, cu, -cd);
}

half4 main(vec2 fragCoord) {
  vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
  vec2 m = iMouse.xy/iResolution.xy;
  half3 col = vec3(0, 0, 0);
  
  vec3 lp = vec3(0); // lookat point (aka camera target)
  vec3 ro = vec3(0, 0, 3); // ray origin that represents camera position
  ro.yz *= rotate(mix(-PI, PI, m.y));
  ro.xz *= rotate(mix(-PI, PI, m.x));
  vec3 rd = camera(ro, lp) * normalize(vec3(uv, -1)); // ray direction
  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  
  vec2 polarUV = vec2(atan(p.x, p.z)/PI, p.y/2.) + 0.5;
  polarUV.x -= iTime * 0.1;
  half3 bufferB = image.eval(polarUV * iImageResolution).rgb;
  half3 sphereColor = bufferB;
  col = mix(col, sphereColor, step(d - MAX_DIST, 0.));
  if (col == vec3(0, 0, 0)) {
    return vec4(0, 0, 0, 0);
  }
  return vec4(col, 1.0);
}`)!;

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
  const x = useValue(0);
  const y = useValue(0);
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
      iTime: clock.current / 2000,
      iResolution: [size, size],
      iImageResolution: [earth?.width() ?? 0, earth?.height() ?? 0],
      iMouse: [x.current, -y.current],
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
