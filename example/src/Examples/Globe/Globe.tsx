import React from "react";
import { View } from "react-native";
import {
  Canvas,
  Fill,
  Shader,
  useClockValue,
  useComputedValue,
  useImage,
  useTouchHandler,
  useValue,
  runDecay,
  ColorShader,
  ImageShader,
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

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float PRECISION = 0.001;
const float PI = 3.14159265359;

float sdCappedTorus(in vec3 p,in vec2 sc,in float ra,in float rb)
{
  p.x=abs(p.x);
  float k=(sc.y*p.x>sc.x*p.y)?dot(p.xy,sc):length(p.xy);
  return sqrt(dot(p,p)+ra*ra-2.*ra*k)-rb;
}

mat2 rotate(float theta) {
  float s = sin(theta), c = cos(theta);
  return mat2(c, -s, s, c);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdScene(vec3 p) {
  return sdSphere(p, 1.0);
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

vec2 map(vec3 p){
  float k=10000.;
  float j=0.;
  for(int i=0;i<3;i++){
    
    vec3 q=p+positions[i];
    
    float a=angles[i];
    q.xz*=mat2(cos(a),sin(a),-sin(a),cos(a));
    a=iTime*2.-float(i*3);
    q.xy*=mat2(cos(a),sin(a),-sin(a),cos(a));
    
    float an=sin(.5);
    float an2=cos(.5);
    vec2 c=vec2(sin(an),cos(an));
    float dk=sdCappedTorus(q,c,.4,.0025);
    if(dk<k){
      k=dk;
      j=mod(float(i),3.);
    }
    
  }
  
  float d=length(p)-.5;
  float y=.1;
  if(k<d){
    y=j+1.2;
  }
  
  d=min(d,k);
  return vec2(d,y);
}

vec3 calcNormal(vec3 p) {
    vec2 e = vec2(1.0, -1.0) * 0.0005;
    float r = 2.;
    return normalize(
      e.xyy * sdScene(p + e.xyy) +
      e.yyx * sdScene(p + e.yyx) +
      e.yxy * sdScene(p + e.yxy) +
      e.xxx * sdScene(p + e.xxx));
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
}
`;

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
      iImageResolution: [100, 100],
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
            <ImageShader
              image={earth}
              tx="repeat"
              ty="repeat"
              fit="cover"
              x={0}
              y={0}
              width={100}
              height={100}
            />
          </Shader>
        </Fill>
      </Canvas>
    </View>
  );
};
