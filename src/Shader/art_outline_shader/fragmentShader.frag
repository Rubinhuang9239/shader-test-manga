#ifdef GL_ES
precision mediump float;
#endif

#include <packing>

// io
uniform bool uUseRenderPass;
uniform bool uUseOutline;

// 采样输入值
// 固有色采样
uniform sampler2D tDiffuse;
// 深度采样
uniform sampler2D tDepth;
// Camera Near Far
uniform float uNear;
uniform float uFar;
// 深度分辨率参数
uniform float uDepthRez;
// 秒边粗细
uniform float uOutlineWeight;


varying vec2 vUv;

// 深度取样间隔
float depthSampleInterv = 0.001f;
// 深度断点值
float depthTreshold = 0.02f;

// 读取正投影的(常规化)深度值
float readDepth( sampler2D depthSampler, vec2 coord ) {

  float maxRange = uFar * uDepthRez;
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, uNear, maxRange);
  return viewZToOrthographicDepth( viewZ, uNear, maxRange);
}

// 值区间映射
// x 输入，a1 源区间最小值，a2 源区间最大值，b1 目标区间最小值，b2 目标区间最大值
float map(float x, float a1, float a2, float b1, float b2) {
  return (((x - a1)/(a2 - a1)) * (b2 - b1) + b1);
}

// 缓入缓出 平方 平滑
float easeInOutQuad(float pos) {
  if ((pos/=0.5f) < 1.0f) return 0.5f * pow(pos,2.0f);
  return -0.5f * ((pos-=2.0f)*pos - 2.0f);
}

float visDepthFall() {
  // current pixel depth 当前像素对应深度
  float cutDepth = readDepth(tDepth, vUv);

  // depth effect 线条韵味之 近粗远细
  float easedDpethSampleInterv = depthSampleInterv * uOutlineWeight * map(
    easeInOutQuad(1.0f - cutDepth),
    0.07f, 1.0f,
    0.25f, 2.4f
  );

  // top pixel
  float topDepth = readDepth(tDepth, vec2(vUv.x, vUv.y - easedDpethSampleInterv));
  // left pixel
  float leftDepth = readDepth(tDepth, vec2(vUv.x - easedDpethSampleInterv, vUv.y));
  // bottom pixel
  float bottomDepth = readDepth(tDepth, vec2(vUv.x, vUv.y + easedDpethSampleInterv));
  // right pixel
  float rightDepth = readDepth(tDepth, vec2(vUv.x + easedDpethSampleInterv, vUv.y));

  // 如果比相邻像素存在深度断层，着色为黑色
  float outline = ( 
    (
      topDepth - cutDepth > depthTreshold ||
      leftDepth - cutDepth > depthTreshold ||
      bottomDepth - cutDepth > depthTreshold ||
      rightDepth - cutDepth > depthTreshold
    ) ? 0.0f : 1.0f
  );

  // light source effect

  // speed source effect
  return outline;
}

// 主循环
void main() {

  // 可视化深度
  // viz out depth map
  // float depth = readDepth(tDepth, vUv);
  // vec3 color = vec3(1.0f-depth);
  // gl_FragColor = vec4(color, 1.0f);

  // 可视化深度断层
  float outline = visDepthFall();

  // 可视化固有色
  vec3 diffuseColor = texture2D(tDiffuse, vUv).rgb;

  // 组装输出色
  vec3 renderColor = (uUseOutline ? vec3(outline) : vec3(1.0)) *
                      (uUseRenderPass ? diffuseColor : vec3(1.0));

  gl_FragColor = vec4(renderColor, 1.0f);
}