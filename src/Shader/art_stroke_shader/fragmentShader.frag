#ifdef GL_ES
precision mediump float;
#endif

// public
uniform vec2 uResolution;

// tex
uniform sampler2D tDiffuse;
uniform sampler2D tToner;
// uniform sampler2D tShadowMask;

// io
uniform bool uUseDiffuse;
uniform bool uUseEmission;
uniform bool uUseShadow;
uniform bool uUseHighlight;
uniform bool uUseLight;
uniform bool uUseShadowMask;
uniform bool uUseReflect;
uniform bool uUseToner;

// 偏差
uniform float uShadowBais;
uniform float uHighlightBais;
uniform float uReflectBais;
uniform float uTonerBais;
uniform float uTonerScale;

// 效果颜色
uniform vec3 uEmissionColor;
uniform vec3 uShadowColor;
uniform vec3 uHighLightColor;
uniform vec3 uReflectColor;

// 点着色器变量
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main(){
  // 读取贴图信息
  vec3 diffuseTex = texture2D( tDiffuse, vUv).rgb;

  // 读取网点纸信息 (一维)
  vec2 coord = gl_FragCoord.xy / uResolution;
  vec2 tileCoord = coord.xy * vec2(uTonerScale) - floor(coord.xy * vec2(uTonerScale));
  float tonerTex = texture2D( tToner, tileCoord).r;

  // 向量点积 视线向量与模型法向量: 相切投影
  float shadow = dot(
    -normalize(vViewDir)-vec3(-0.05f,-0.1f,0.1f),
    vNormal
  );
  float shadow_stroke = shadow < uShadowBais ? 0.0f : 1.0f;
  // 向量点积 视线向量与模型法向量: 相切反光
  float reflect_stroke = shadow < uReflectBais ? 1.0f : 0.0f;
  // 向量点积 视线向量与模型法向量: 相切暗部
  float tone_stroke = shadow < uTonerBais ? 1.0f : 0.0f;

  // 向量点积 视线向量与模型法向量: 相切高光
  float highLight = dot(
    -normalize(vViewDir)-vec3(0.5f,2.5f,-2.8f),
    vNormal
  );
  float high_light_stroke = highLight > uHighlightBais ? 0.0f : 1.0f;

  // 组合颜色
  vec3 rend_color = (
    ( 
      (uUseDiffuse ? diffuseTex : vec3(0.95f)) *
      (uUseShadow ? vec3(shadow_stroke) : vec3(1.0f)) *
      (uUseToner ? ((tone_stroke>0.0f) ? vec3(tonerTex * tone_stroke) : vec3(1.0f)) : vec3(1.0f) )+
      (uUseEmission ? uEmissionColor : vec3(0.0f)) +
      (uUseReflect ? (uReflectColor * reflect_stroke) : vec3(0.0f)) +
      (uUseHighlight ? ( uHighLightColor * high_light_stroke ) : vec3(0.0f))
    ) 
  );

  gl_FragColor = vec4(rend_color, 1.0f);
}