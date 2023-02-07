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

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float Hash21(vec2 p) {
    p = fract(p*vec2(123.34,233.53));
    p += dot(p, p+23.234);
    return fract(p.x*p.y);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float GetDist(vec3 p) {
    float d = sdBox(p, vec3(1));
    
    d = length(p)-1.5;
    
    vec2 uv = vec2(atan(p.x, p.z)/6.2832, p.y/3.)+.5;
    float disp = image.eval(uv).r;
    
    disp *= smoothstep(1.4, 1., abs(p.y));
    d -= disp*.3;
    
    return d*.7;
}

vec3 Transform(vec3 p) {
     p.xy *= Rot(iTime*.4);
     p.xz *= Rot(iTime*.2);
     
     return p;
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = Transform(ro + rd*dO);
       
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    
    return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
    vec2 e = vec2(.001, 0);
    
    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx));
    
    return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i);
    return d;
}



half4 main( vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	vec2 m = iMouse.xy/iResolution.xy;
    
    vec3 col = vec3(0);
    
    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0), 1.);

    float d = RayMarch(ro, rd);
    
    if(d<MAX_DIST) {
    	vec3 p = Transform(ro + rd * d);
        
        
    	vec3 n = GetNormal(p);
        
    	float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
    	col += dif*dif;
        
        vec3 colXZ = image.eval(p.xz*.5+.5).rgb;
        vec3 colYZ = image.eval(p.yz*.5+.5).rgb;
        vec3 colXY = image.eval(p.xy*.5+.5).rgb;
        
        n = abs(n);
        
        n *= pow(n, vec3(2));
        n /= n.x+n.y+n.z;
        
        col = colYZ*n.x + colXZ*n.y + colXY*n.z;
        
        uv = vec2(atan(p.x, p.z)/6.2832, 2.*p.y/3.)+.5;
        
        uv.x = fract(uv.x-iTime*.1);
        col *= dif;
    }
    
  
    if (col.rgb == vec3(0, 0, 0)) {
      return vec4(col,0.0);
    }
    return vec4(col,1.0);
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
      iTime: clock.current / 600,
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
            fit="fill"
            x={0}
            y={0}
            tx="repeat"
            ty="repeat"
            width={100}
            height={100}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
