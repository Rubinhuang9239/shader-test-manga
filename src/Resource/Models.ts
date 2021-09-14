import { Vector3 } from 'three';

import { ENUM_MODEL_TYPE } from './ConstAndEnum';

import * as ui_goku_stand_fbx from '../assets/model/ui_goku_stand/ui_goku_stand.fbx';
import * as ui_goku_stand_tex from '../assets/model/ui_goku_stand/ui_goku_stand.jpg';

import * as ui_goku_rush_fbx from '../assets/model/ui_goku_rush/ui_goku_rush.fbx';
import * as ui_goku_rush_tex from '../assets/model/ui_goku_rush/ui_goku_rush.jpg';

import * as mustang_fbx from '../assets/model/mustang/mustang_fbx.fbx';
// import * as mustang_tex from '../assets/model/mustang/mustang_tex.fbx';

export interface IModelAssetInfo{
  key: string;
  type: ENUM_MODEL_TYPE,
  model: any,
  diffuse_tex?: any,
  normal_map?: any,
  custom_transform?: {
    translate?: Vector3,
    scale?: Vector3,
    rotate?: Vector3,
  },
}

export const ui_goku_rush : IModelAssetInfo = {
  key: 'ui_goku_rush',
  type: ENUM_MODEL_TYPE.FBX,
  model: ui_goku_rush_fbx.default,
  diffuse_tex: ui_goku_rush_tex.default,
  normal_map: undefined,
  custom_transform: {
    translate: new Vector3(0,-160,-50),
    scale: undefined,
    rotate: undefined,
  },
};

export const ui_goku_stand : IModelAssetInfo = {
  key: 'ui_goku_stand',
  type: ENUM_MODEL_TYPE.FBX,
  model: ui_goku_stand_fbx.default,
  diffuse_tex: ui_goku_stand_tex.default,
  normal_map: undefined,
  custom_transform: {
    translate: new Vector3(0, -90, 0),
    scale: new Vector3(0.67, 0.67, 0.67),
    rotate: undefined,
  },
};

export const mustang : IModelAssetInfo = {
  key: 'mustang',
  type: ENUM_MODEL_TYPE.FBX,
  model: mustang_fbx.default,
  diffuse_tex: undefined,
  normal_map: undefined,
  custom_transform: {
    translate: new Vector3(0, -25, 0),
    scale: new Vector3(0.18, 0.18, 0.18),
    rotate: undefined,
  },
};