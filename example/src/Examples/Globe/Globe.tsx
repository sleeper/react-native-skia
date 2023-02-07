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
const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float iTime;
uniform float2 iResolution;
uniform float2 iImageResolution;
uniform float r;
uniform float2 iMouse;
const float PI = 3.14159265359;
const float EPSILON = 1e-4;
const int MAX_STEPS = 100;
const float MAX_DIST  = 100;
const float SURF_DIST = .001;


vec2 rotate13(
    
  vec2  lrf, 
  float guvf) {
float vf  = cos(guvf); 
  float n   = sin(guvf);
  mat2  wbxr = mat2(vf,n,n,-vf);
  
  return lrf * wbxr;
}

half4 main( vec2 fragCoord )
{
vec2 uv = fragCoord.xy / iResolution.xy;
  uv -= 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv *= 2.2;
  vec2 m = (iMouse.xy / iResolution.xy) - 0.5;
  bool clicked = false;
  if (length(uv) > 1.0) {
    return vec4(0.0,0.0,0.0,1.0);
  }
  uv = mix(uv,normalize(uv)*(2.0*asin(length(uv)) / 3.1415926),0.5);
  vec3 n = vec3(uv, sqrt(1.0 - uv.x*uv.x - uv.y*uv.y));
  uv = normalize(uv)*(2.0*asin(length(uv)) / 3.1415926);
  
  float phase = iTime * 0.33;
  float phase2 = -m.y * 4.0;
  
  vec3 lightvec = vec3(1.0,1.0,0.0);
  if (clicked) {
    lightvec.yz = rotate13(lightvec.yz, phase2 * 0.5 * 3.1415926);
  uv.y += phase2;
  } else {
    lightvec.xz = rotate13(lightvec.xz, phase * 0.5 * 3.1415926);
    uv.x += phase;
  }

  float lit = mix(1.0, max(0.0, dot(n, normalize(lightvec))), 0.98);
  
  lit += 0.3*pow(1.0 - max(0.0, n.z), 2.0);
  
  lit = sqrt(lit);
 
  
  uv *= 2.0;
  vec3 color = image.eval((uv * 0.5 + 0.5) * iImageResolution).rgb;
  
return vec4(color,1.0);
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
      iTime: clock.current / 6000,
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
