// Dependencies
import React from 'react';
import { AppContainer, TweakContainer, WebGLContainer } from './Style/WebglStyle';
import {
  PerspectiveCamera, Scene, WebGLRenderer,
  Mesh,
  Vector3,
  Box3,
  FrontSide,
  AmbientLight,
  DirectionalLight,
  WebGLRenderTarget,
  DepthTexture,
  UnsignedShortType,
  NearestFilter,
  DepthFormat,
  RGBFormat,
  sRGBEncoding,
  ShaderMaterial,
  Texture,
  Group,
  Object3D,
  Vector2,
  ClampToEdgeWrapping,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Asset3DLoadMeter, loadFBX, loadTex } from './WebGLComps/WebGLUtils';
import { makeArtOutlineShader } from './Shader/art_outline_shader';
import { makeArtStrokeShader, artStrokeUniforms } from './Shader/art_stroke_shader';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import Stats from 'stats.js';
import dat from 'dat.gui';

import {
  IModelAssetInfo,
  mustang,
  ui_goku_rush,
  ui_goku_stand,
} from './Resource/Models';
import { initStatsUtils } from './Comps/StatsUtilities';
import { initTweakUtils } from './Comps/TweakUtilities';
import * as manga_toner_tex from './assets/common/toner_tex.jpg';

export const SceneManager : {
  scene: Scene;
  camera: PerspectiveCamera;
  composer: EffectComposer;
  displayGroup: Group;
  depthTarget?: WebGLRenderTarget;
  renderPass?: RenderPass;
  artOutlinePass?: ShaderPass;
} = {
  scene: new Scene(),
  camera: new PerspectiveCamera(70, 4/3, 0.1, 1600),
  composer: new EffectComposer(
    new WebGLRenderer({
      alpha: true,
      depth: true,
      antialias: true,
    }),
  ),
  displayGroup: new Group(),
  depthTarget: undefined,
  renderPass: undefined,
  artOutlinePass: undefined,
};

export const SceneUtils : {
  stats: Stats,
  tweakGUI: dat.GUI,
  loadedModels: {[key:string]:Object3D};
  modelLib: IModelAssetInfo[];
} = {
  stats: new Stats(),
  tweakGUI: new dat.GUI({autoPlace: false, name: 'Managa-Render-Test', width: 560}),
  loadedModels: {},
  modelLib: [
    ui_goku_rush,
    ui_goku_stand,
    mustang,
  ]
}

const App: React.FC = () => {

  const webGLContainer = React.useRef<HTMLDivElement | null>();
  const tweakContainer = React.useRef<HTMLDivElement | null>();

  React.useEffect(()=>{
    if(!webGLContainer.current){ return; }
    initWebGL(webGLContainer.current);
    initStatsUtils();
    initTweakUtils(undefined, loadSceneObjects)
  }, [webGLContainer.current]);

  // Init WebGL
  const initWebGL = async(parentElement: HTMLDivElement) => {

    // const testCube = new Mesh(new BoxGeometry(10, 10, 10), new MeshBasicMaterial({color: 0xff9900})); 
    // SceneManager.scene.add(testCube);

    // Group
    SceneManager.scene.add(SceneManager.displayGroup);

    // Lights
    const amLight = new AmbientLight(0xFFFFFF, 0.4);
    SceneManager.scene.add(amLight);

    const dirLight = new DirectionalLight(0x6699FF, 1.5);
    dirLight.target.position.set(0,0,0);
    dirLight.position.set(200, -100, 0);
    SceneManager.scene.add(dirLight);

    // Camera
    const parentBoundRect = parentElement.getBoundingClientRect();
    SceneManager.camera.aspect = parentBoundRect.width/parentBoundRect.height;
    SceneManager.camera.updateProjectionMatrix();
    SceneManager.camera.position.set(0, 40, -180);
    SceneManager.camera.lookAt(0,0,0);

    // Renderer
    SceneManager.composer.renderer.setClearColor(0x555555);
    // SceneManager.composer.renderer.autoClear = false;

    SceneManager.composer.setSize(parentBoundRect.width, parentBoundRect.height);
    SceneManager.composer.renderer.setSize(parentBoundRect.width, parentBoundRect.height);
    SceneManager.composer.renderer.setPixelRatio(window.devicePixelRatio);
    
    // canvas
    parentElement.appendChild(SceneManager.composer.renderer.domElement);

    // Pass
    SceneManager.renderPass = new RenderPass( SceneManager.scene, SceneManager.camera );
    SceneManager.composer.addPass( SceneManager.renderPass );
    addShaderPasses();

    SceneManager.depthTarget = new WebGLRenderTarget(
      parentBoundRect.width, parentBoundRect.height
    );
    SceneManager.depthTarget.texture.format = RGBFormat;
    SceneManager.depthTarget.texture.encoding = sRGBEncoding;
    SceneManager.depthTarget.texture.minFilter = NearestFilter;
    SceneManager.depthTarget.texture.magFilter = NearestFilter;
    SceneManager.depthTarget.texture.generateMipmaps = false;
    SceneManager.depthTarget.stencilBuffer = false;
    SceneManager.depthTarget.depthBuffer = true;
    SceneManager.depthTarget.depthTexture = new DepthTexture(parentBoundRect.width, parentBoundRect.height);
    SceneManager.depthTarget.depthTexture.format = DepthFormat;
    SceneManager.depthTarget.depthTexture.type = UnsignedShortType;

    // Orbit Controls
    const controls = new OrbitControls( SceneManager.camera, SceneManager.composer.renderer.domElement );

    // Scene Objects
    loadSceneObjects( SceneUtils.modelLib[0] );
    // Kick Off
    requestAnimationFrame(animate);
  }

  // Scene Objects
  // clear
  const clearDisplayGroup = async () => {
    while(SceneManager.displayGroup.children.length > 0){
      SceneManager.displayGroup.remove(
        SceneManager.displayGroup.children[0]
      );
    }
  }

  // load
  const loadSceneObjects = async(modelInfo?: IModelAssetInfo) => {

    if(!modelInfo){ return; }

    const {
      key,
      model,
      model_diffuse_tex,
      custom_transform,
    } = modelInfo;

    clearDisplayGroup();

    if(SceneUtils.loadedModels[key]){
      // add to scene
      const loadedModel = SceneUtils.loadedModels[key];
      SceneManager.displayGroup.add(loadedModel);
      // related changes
      artStrokeUniforms.tDiffuse.value = loadedModel.userData.tDiffuseBackup;
      return;
    }

    const _model = await loadFBX(
      model,
      new Asset3DLoadMeter(
        ()=>{console.info('[FBX Loader] Start Loading', model);},
        (process)=>{console.info('[FBX Loader] Loading', model, process);},
        ()=>{console.info('[FBX Loader] Finishing Loading', model);}
      )
    );

    console.log('[model loaded]', _model);

    let entireMax : Vector3 | undefined;
    let entireMin : Vector3 | undefined;

    const diffuse_tex = model_diffuse_tex ? await loadTex(model_diffuse_tex): undefined;

    const toner_tex = await loadTex(manga_toner_tex.default);
    // repeat
    toner_tex.wrapS = ClampToEdgeWrapping;
    toner_tex.wrapT = ClampToEdgeWrapping;

    const artStrokeMaterial = await prepareStrokeMaterial(diffuse_tex, toner_tex);

    _model.userData['tDiffuseBackup'] = diffuse_tex;

    // texturing and find out entire bbox
    _model.traverse(child => {
      if (child.type !== 'Mesh') { return; }
      const mesh = (child as Mesh);
      mesh.material = artStrokeMaterial;
      console.log('material replaced.')
      // new MeshStandardMaterial({ color: 0xFFFFFF, side: FrontSide, map: _tex });

      mesh.geometry.computeBoundingBox();
      const cntBbox = mesh.geometry.boundingBox;

      // first assign
      if(!entireMax){ entireMax = cntBbox?.max; }
      if(!entireMin){ entireMin = cntBbox?.min; }

      if (!entireMax || !entireMin || !cntBbox) { return; }
      entireMax.x = (entireMax.x > cntBbox.max.x) ? entireMax.x : cntBbox.max.x;
      entireMax.y = (entireMax.y > cntBbox.max.y) ? entireMax.y : cntBbox.max.y;
      entireMax.z = (entireMax.z > cntBbox.max.y) ? entireMax.z : cntBbox.max.z;
      entireMin.x = (entireMin.x < cntBbox.min.x) ? entireMin.x : cntBbox.min.x;
      entireMin.y = (entireMin.y < cntBbox.min.y) ? entireMin.y : cntBbox.min.y;
      entireMin.z = (entireMin.z < cntBbox.min.y) ? entireMin.z : cntBbox.min.z;
    });
    
    const modelBBox = new Box3(entireMin, entireMax);
    const center = modelBBox.getCenter(new Vector3());
    const correction = center.multiplyScalar(-1.0);
    console.log('[Auto Position Correction]', correction);

    // position correction
    _model.position.copy(
      new Vector3().addVectors(
        correction,
        custom_transform?.translate || new Vector3(0,0,0)
      )
    );

    // size correction
    _model.scale.copy(
      custom_transform?.scale || new Vector3(1,1,1)
    );

    // rotation correction
    _model.rotation.set(
      custom_transform?.rotate?.x || 0,
      custom_transform?.rotate?.y || 0,
      custom_transform?.rotate?.z || 0,
    );

    // Record in model lib
    SceneUtils.loadedModels[key] = _model;

    // vertex normal helper
    if(_model.children[0] && _model.children[0].type==='Mesh'){
      const vertNormalHelper = new VertexNormalsHelper(_model.children[0], 2.0, 0x447799);
      _model.userData['vertNormalHelper'] = vertNormalHelper;
      //_model.add(vertNormalHelper);
    }

    // add to scene
    SceneManager.displayGroup.add(_model);
  };

  // Customized Material
  const prepareStrokeMaterial = async(diffuse_tex?: Texture, toner_tex?: Texture) => {
    const { vertexShader, fragmentShader } = await makeArtStrokeShader();
    artStrokeUniforms.tDiffuse.value = diffuse_tex;
    artStrokeUniforms.tToner.value = toner_tex;
    // artStrokeUniforms.uResolution.value = SceneManager.composer.renderer.getSize(new Vector2());
    // console.log(artStrokeUniforms.uResolution.value);

    return new ShaderMaterial({
      vertexShader: vertexShader as string,
      fragmentShader: fragmentShader as string,
      uniforms: artStrokeUniforms,
      lights: false,
      transparent: false,
      side: FrontSide,
    });
  }

  // Extra Passes

  const addShaderPasses = async () => {
    const artOutlineShader = await makeArtOutlineShader();
    SceneManager.artOutlinePass = new ShaderPass(artOutlineShader, 'tDiffuse');
    SceneManager.artOutlinePass.uniforms.uNear.value = SceneManager.camera.near;
    SceneManager.artOutlinePass.uniforms.uFar.value = SceneManager.camera.far;
    SceneManager.composer.addPass(SceneManager.artOutlinePass);
  };

  // Render
  const renderForDepth = () => {
    if(!SceneManager.depthTarget || !SceneManager.artOutlinePass){return;}
    // set target
    SceneManager.composer.renderer.setRenderTarget(SceneManager.depthTarget)
    // render depth
    SceneManager.composer.renderer.render(SceneManager.scene, SceneManager.camera);
    // assign depth texture to artOutlineShader uniforms
    SceneManager.artOutlinePass.uniforms.tDepth.value = SceneManager.depthTarget.depthTexture;
    // remove target
    SceneManager.composer.renderer.setRenderTarget(null);
  }

  const renderDiffuse = () => {
    SceneManager.composer.render();
  }

  const animate = (time: number) => {
    requestAnimationFrame(animate);
    SceneUtils.stats.begin();
    renderForDepth();
    renderDiffuse();
    SceneUtils.stats.end();
  }

  // Return JSX Container
  return (
    <AppContainer>
      <WebGLContainer className='webgl-container' ref={ref=>(webGLContainer.current = ref)} />
      <TweakContainer className='tweak-container' ref={ref=>(tweakContainer.current = ref)}/>
    </AppContainer>
  );
};

export default App;