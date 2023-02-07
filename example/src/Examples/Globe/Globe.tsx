import {
  Canvas,
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

// https://www.shadertoy.com/view/Ml2XRV
// https://www.shadertoy.com/view/sdj3Rc
const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float iTime;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float r;
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

float sdSphere(vec3 p, float r )
{
  return length(p) - r;
}

float sdScene(vec3 p) {
  return sdSphere(p, 1.);
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

half4 main( vec2 fragCoord )
{
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
  vec3 normal = calcNormal(p);
  vec3 lightPosition = vec3(4, 4, 7);
  vec3 lightDirection = normalize(lightPosition - p);

  float diffuse = dot(normal, lightDirection) * 0.5 + 0.5;
  
  vec2 polarUV = vec2(atan(p.x, p.z)/PI, p.y/2.) + 0.5;
  polarUV.x -= iTime * 0.1;
  half3 bufferB = image.eval(polarUV * iImageResolution).rgb;
  half3 sphereColor = diffuse * bufferB;
  
  col = mix(col, sphereColor, step(d - MAX_DIST, 0.));
  if (col == vec3(0, 0, 0)) {
    return vec4(0, 0, 0, 0);
  }
  return vec4(col, 1.0);
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
      iTime: clock.current / 2000,
      iResolution: [width, height],
      iImageResolution: [earth?.width() ?? 0, earth?.height() ?? 0],
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
          <ImageShader image={earth} tx="repeat" ty="repeat" />
        </Shader>
      </Fill>
    </Canvas>
  );
};
