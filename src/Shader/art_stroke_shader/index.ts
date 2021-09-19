import { loadShader, loadTex } from '../../WebGLComps/WebGLUtils';
import * as vert from './vertexShader.vert';
import * as frag from './fragmentShader.frag';
import { Vector2, Vector3 } from 'three';

const artStrokeUniforms : {[key: string]: any} = {
	uResolution: {value: new Vector2(1024, 1024)},

	tDiffuse: {value: null},
	tToner: {value: null},

	uUseDiffuse: {value: true},
	uUseReflect: {value: true},
	uReflectBais: {value: 0.22},
	uUseEmission: {value: true},
	uUseShadow: {value: true},
	uShadowBais: {value: 0.28},
	uUseHighlight: {value: true},
	uHighlightBais: {value: 0.08},
	uUseLight: {value: false},
	uUseToner: {value: false},
	uTonerBais: {value: 0.55},
	uTonerScale: {value: 5.5},
	uUseShadowMask: {value: false},

	uEmissionColor: {value: new Vector3(0.0, 0.0, 0.0)},
  uShadowColor: {value: new Vector3(0.0, 0.0, 0.0)},
	uHighLightColor: {value: new Vector3(1.0, 1.0, 1.0)},
	uReflectColor: {value: new Vector3(0.1, 0.15, 0.2)},
};

const makeArtStrokeShader = async() => {
  return {
		vertexShader: await loadShader(vert.default),
		fragmentShader: await loadShader(frag.default),
	}
};

export{ makeArtStrokeShader, artStrokeUniforms };