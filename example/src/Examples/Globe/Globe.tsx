import React from "react";
import { View } from "react-native";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  useClockValue,
  useComputedValue,
  useImage,
  useTouchHandler,
  useValue,
  runDecay,
} from "@shopify/react-native-skia";

import { frag } from "./ShaderLib";

// shader toy: https://www.shadertoy.com/view/fdlGWX
// https://www.shadertoy.com/view/XsB3Rm
const source = frag`
uniform shader image;
uniform float iTime;
uniform float iFrame;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float2 iMouse;

uniform float angles[10];
uniform vec3 positions[10];

float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)
{
  p.x = abs(p.x);
  float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
  return sqrt(dot(p, p) + ra * ra - 2.0 * ra * k) - rb;
}

vec2 map(vec3 p) {
  float k = 10000.;
  float j = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 q = p + positions[i];

    float a = angles[i];
    q.xz *= mat2(cos(a), sin(a), -sin(a), cos(a));
    a = iTime * 2. - float(i * 3);
    q.xy *= mat2(cos(a), sin(a), -sin(a), cos(a));

    float an = sin(0.5);
    float an2 = cos(0.5);
    vec2 c = vec2(sin(an), cos(an));
    float dk = sdCappedTorus(q, c, 0.4, 0.0025);
    if (dk < k) {
      k = dk;
      j = mod(float(i), 3.);
    }
  }

  float d = length(p) - 0.5;
  float y = 0.1;
  if (k < d) {
    y = j + 1.2;
  }

  d = min(d, k);
  return vec2(d, y);
}

vec2 ray(vec3 ro, vec3 rd) {
  float t;
  vec2 h;
  vec3 p;
  for (int i = 0; i < 200; i++) {
    p = ro + rd * t;
    h = map(p);
    if (h.x < 0.0001) break;
    t += h.x;
    if (t > 20.) break;
  }
  if (t > 20.) t = -1.;
  return vec2(t, h.y);
}

vec3 calcNorm(vec3 p) {
  const float eps = 0.0001;
  vec4 n = vec4(0.0);
  for (int i = 0; i < 4; i++)
  {
    vec4 s = vec4(p, 0.0);
    s[i] += eps;
    n[i] = map(s.xyz).x;
  }
  return normalize(n.xyz - n.w);
}

vec3 render(vec3 ro, vec3 rd) {
  vec2 t = ray(ro, rd);
  vec3 sk = vec3(1. - rd.y, 1. - rd.y, 1.);

  vec3 p1 = ro + rd * t.x;

  vec3 col = smoothstep(2.45, 2.5, length(p1)) * vec3(1.);
  if (t.x > 0.0) {
    vec3 p = ro + rd * t.x;
    vec3 n = calcNorm(p);
    if (t.y > 3.) {
      col = vec3(0., 1., 0.);
    }
    else if (t.y > 2.) {
      col = vec3(1., 1., 1.);
    }
    else if (t.y > 1.) {
      col = vec3(1., 0., 0.);
    }
    else if (t.y > 0.) {
      vec3 q = n;

      vec3 sun = normalize(vec3(0.2, 5., 0.4));
      vec3 r = reflect(-sun, n);
      vec3 spec = pow(max(0.0, dot(r, -rd)), 32.) * vec3(1.);

      vec2 longitudeLatitude = vec2(
        (atan(q.y, q.x) / 3.1415926 + 1.0) * 0.5,
        1.0 - acos(q.z) / 3.1415926);

      float land = 1. - smoothstep(0.6, 0.4, image.eval(longitudeLatitude).y);
      col = mix(vec3(0.5, 0.5, 1.) * 0.5, vec3(0.1, 0.9, 0.1), land) + spec * 0.7;
    }
  }

  return col;
}

vec4 main(in vec2 fragCoord)
{
  vec2 uv = (2. * fragCoord - iResolution.xy) / iResolution.y;
  float an_x = 10. * -iMouse.x / iResolution.x;
  float an_y = 10. * -iMouse.y / iResolution.y;
  //an_x=0.;
  an_x += sin(iTime / 20.) / 5. - 0.45;
  vec3 ta = vec3(0.0, 0.0, 0.0);
  float off = 1.5;
  vec3 ro = ta + vec3(sin(an_x) * off, 0.0, cos(an_x) * off);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);
  vec3 col = render(ro, rd);
  return vec4(col, 1.0);
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
  const vec3 = (...args: number[]) => args;
  const uniforms = useComputedValue(() => {
    return {
      iTime: clock.current * 0.001,
      iFrame: clock.current,
      iResolution: [size, size],
      iImageResolution: [earth?.width() ?? 0, earth?.height() ?? 0],
      iMouse: [x.current, y.current],
      angles: [0, 0.5, 1.4, 2.9, 4.5, 0.8, 2, 1, 3, 5.5],
      positions: [
        vec3(0.2, 0, 0),
        vec3(0, 0.3, 0),
        vec3(-0.3, 0, 0),
        vec3(0, 0, 0.25),
        vec3(0, -0.2, 0),
        vec3(0.2, 0.2, 0),
        vec3(0.1, 0.3, 0),
        vec3(-0.3, 0.1, 0.2),
        vec3(-0.3, 0, 0.25),
        vec3(0.1, -0.2, -0.1),
      ],
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
