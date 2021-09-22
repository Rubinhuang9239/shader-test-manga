import { Color } from "three";
import { SceneManager, SceneUtils } from "../App";
import { IModelAssetInfo } from "../Resource/Models";
import { artOutlineUniforms } from "../Shader/art_outline_shader";
import { artStrokeUniforms } from "../Shader/art_stroke_shader";

export const initTweakUtils = (element?: HTMLElement, loadSceneObjects?: (modelInfo?: IModelAssetInfo)=>Promise<any> ) =>{
  (element ? element : document.body).appendChild( SceneUtils.tweakGUI.domElement);
  SceneUtils.tweakGUI.domElement.style.position = 'absolute';
  SceneUtils.tweakGUI.domElement.style.top = '0px';
  SceneUtils.tweakGUI.domElement.style.right = '0px';
  SceneUtils.tweakGUI.domElement.style.left = 'auto';

  const sceneConfigFolder = SceneUtils.tweakGUI.addFolder('Scene Configs 场景设置');
  sceneConfigFolder.addColor({ rendererClearColor: (SceneManager.composer.renderer.getClearColor(new Color())).getHex()}, 'rendererClearColor')
  .name('Scene Background Color').onChange(val=>{
    SceneManager.composer.renderer.setClearColor(new Color(val));
  });
  sceneConfigFolder.open();

  const testModelsFolder = SceneUtils.tweakGUI.addFolder('Test Models 测试模型');
  testModelsFolder.add(
    { modelKey: SceneUtils.modelLib[0]?.key },
    'modelKey', Object.fromEntries(SceneUtils.modelLib.map(e => [e.key, e.key]))
  ).name('Use Test Model').onChange(key=>{
    if(!loadSceneObjects) { return; }
    loadSceneObjects(SceneUtils.modelLib.find(item=>item.key === key));
  })
  testModelsFolder.open();

  const postProcessingFolder = SceneUtils.tweakGUI.addFolder('Post Processing 后期渲染');

    const artlinePassFolder = postProcessingFolder.addFolder('Artline 描边 Pass');

    artlinePassFolder.add({enable: true}, 'enable', true).name('🔌 Enable  生效描边').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.enabled = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uDepthOnly, 'value', true).name('📏 Show Depth Only 只显示深度数据').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uDepthOnly.value = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uDepthRez, 'value', 0.0, 0.5, 0.01).name('Depth Resolution 深度分辨率').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uDepthRez.value = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uUseRenderPass, 'value', true).name('📸 Enable Render Pass 基础渲染周期').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uUseRenderPass.value = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uUseOutline, 'value', true).name('🔲 Enable Outline 深度边缘').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uUseOutline.value = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uOutlineWeight, 'value', 0.1, 4.0, 0.1).name('Outline Weight 描边粗细').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uOutlineWeight.value = val;
    });
    artlinePassFolder.add(artOutlineUniforms.uOutlineEasingParam, 'value', 1.0, 6.0, 0.1).name('Outline W Easing 描边粗细线性平滑参数').onChange(val=>{
      if(!SceneManager.artOutlinePass){ return; }
      SceneManager.artOutlinePass.uniforms.uOutlineEasingParam.value = val;
    });
    artlinePassFolder.open();

    const unrealBloomPassFolder = postProcessingFolder.addFolder('Bloom Pass 辉光');

    unrealBloomPassFolder.add({enable: false}, 'enable', true).name('🔌 Enable  生效辉光').onChange(val=>{
      if(!SceneManager.uBloomPass){ return; }
      SceneManager.uBloomPass.enabled = val;
    });
    unrealBloomPassFolder.add({strength: 0.4}, 'strength', 0.05, 0.9, 0.05).name('Strength  辉光强度').onChange(val=>{
      if(!SceneManager.uBloomPass){ return; }
      SceneManager.uBloomPass.strength = val;
    });
    unrealBloomPassFolder.add({threshold: 0.75}, 'threshold', 0.4, 1.0, 0.05).name('Strength  辉光临界').onChange(val=>{
      if(!SceneManager.uBloomPass){ return; }
      SceneManager.uBloomPass.threshold = val;
    });
    unrealBloomPassFolder.add({radius: 0.10}, 'radius', 0.05, 0.5, 0.01).name('Radius  辉光半径').onChange(val=>{
      if(!SceneManager.uBloomPass){ return; }
      SceneManager.uBloomPass.radius = val;
    });
    unrealBloomPassFolder.open();
  
  postProcessingFolder.open();

  const objectShadingFolder = SceneUtils.tweakGUI.addFolder('Object Shading 物体着色器');
  objectShadingFolder.add(artStrokeUniforms.uUseDiffuse, 'value', true).name('🗺 Enable Diffuse 底色贴图');
  objectShadingFolder.add(artStrokeUniforms.uUseShadow, 'value', true).name('💎 Enable Tangent Shadow 切线阴影描边');
  objectShadingFolder.add(artStrokeUniforms.uShadowBais, 'value', 0.01, 1.00, 0.01).name('Tangent Shadow Bais 切线偏差');
  objectShadingFolder.add(artStrokeUniforms.uUseHighlight, 'value', true).name('🌟 Enable Highlight 高光');
  objectShadingFolder.add(artStrokeUniforms.uHighlightBais, 'value', 0.01, 1.00, 0.01).name('Highlight Bais 高光偏差');
  objectShadingFolder.add(artStrokeUniforms.uUseReflect, 'value', true).name('🪞 Enable Reflection 反光');
  objectShadingFolder.add(artStrokeUniforms.uReflectBais, 'value', 0.01, 1.00, 0.01).name('Reflection Bais 反光偏差');
  objectShadingFolder.add(artStrokeUniforms.uUseToner, 'value', false).name('🏁 Enable Toner 使用网目纸');
  objectShadingFolder.add(artStrokeUniforms.uTonerBais, 'value', 0.01, 1.00, 0.01).name('Toner Bais 网目纸偏差');
  objectShadingFolder.add(artStrokeUniforms.uTonerScale, 'value', 1.0, 6.0, 0.05).name('Toner Scale 网目纸缩放');
  objectShadingFolder.add(artStrokeUniforms.uUseShadowMask, 'value', true).name('🎭 Enable Shadow Musk 切线描边遮罩');
  objectShadingFolder.add(artStrokeUniforms.uUseEmission, 'value', true).name('✨ Enable Emission 自发光');
  objectShadingFolder.add(artStrokeUniforms.uUseDirLight, 'value', false).name('💡 Enable Light Receiving 受光').onChange(val=>{
    const helper = SceneManager.dirLight?.userData['dirLightHelper'];
    val ? SceneManager.scene.add(helper) : SceneManager.scene.remove(helper);
  });
  objectShadingFolder.open();

  const helperFolder = SceneUtils.tweakGUI.addFolder('Helpers 辅助工具');
  helperFolder.add({useVertexNormalHelper: false}, 'useVertexNormalHelper', false)
  .name('Show Vertex Normal Helper 显示法向量').onChange(val=>{
    const cntModel = SceneManager.displayGroup.children[0];
    val?
    cntModel?.add(cntModel.userData.vertNormalHelper):
    cntModel?.remove(cntModel.userData.vertNormalHelper);
  });
  helperFolder.open();

  // uEmissionColor: {value: new Vector3(0.0, 0.0, 0.0)},
  // uShadowColor: {value: new Vector3(1.0, 1.0, 1.0)},
	// uHighLightColor: {value: new Vector3(1.0, 1.0, 1.0)},
	// uReflectColor: {value: new Vector3(0.2, 0.3, 0.6)},
}