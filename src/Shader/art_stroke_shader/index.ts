import { loadShader } from '../../WebGLComps/WebGLUtils';
import * as vert from './vertexShader.vert';
import * as frag from './fragmentShader.frag';
import { Vector3 } from 'three';

const artStrokeUniforms : {[key: string]: any} = {
	tDiffuse: {value: null},

	uUseDiffuse: {value: true},
	uUseReflect: {value: true},
	uReflectBais: {value: 0.22},
	uUseEmission: {value: true},
	uUseShadow: {value: true},
	uShadowBais: {value: 0.30},
	
	uUseHighlight: {value: true},
	uHighlightBais: {value: 0.08},
	uUseLight: {value: false},
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