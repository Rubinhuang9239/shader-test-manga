#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_uv;
uniform sampler2D u_distortTex;
uniform sampler2D u_diffuseTex;
uniform vec2 u_distortDir;
uniform float u_distortVal;
uniform float u_aspectScale;
uniform bool u_landscape;
uniform float u_zoomIn;

void main(){
  float distort = clamp(
    texture2D(u_distortTex, v_uv).r,
    0.0,
    0.65
  );

  vec2 aspectScaleFactor = u_landscape ? vec2(1.0, u_aspectScale) : vec2(u_aspectScale, 1.0);

  vec3 diffuseTex = texture2D(
    u_diffuseTex, 
    (
      (
        v_uv * aspectScaleFactor - (aspectScaleFactor - vec2(1.0)) * 0.5
      ) * u_zoomIn + (1.0-u_zoomIn) * 0.5
      + (u_distortVal * u_distortDir * distort)
    )
  ).rgb;
  gl_FragColor = vec4(diffuseTex, 1.0);
}