/**
 * Full-screen textured quad shader
 */

import { loadShader } from '../../WebGLComps/WebGLUtils';
import * as vert from './vertexShader.vert';
import * as frag from './fragmentShader.frag';

const artOutlineUniforms : {[key: string]: any} = {
	uDepthOnly: {value: false},
	uDepthRez: {value: 0.1},
	uUseOutline: {value: true},
	uUseRenderPass: {value: true},
	tDiffuse: {value: null},
	tDepth: {value: null},
	uNear: {value: null},
	uFar: {value: null},
	uOutlineWeight: {value: 2.0},
	uOutlineEasingParam: {value: 2.0},
};

const makeArtOutlineShader = async() => {
	return {
		uniforms: artOutlineUniforms,
		vertexShader: await loadShader(vert.default),
		fragmentShader: await loadShader(frag.default),
	}
};

export { makeArtOutlineShader, artOutlineUniforms };
