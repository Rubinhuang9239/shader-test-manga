import { Group, TextureLoader, Texture } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FileLoader } from 'three';
import { v4 as uuidv4 } from 'uuid';

export class Asset3DLoadMeter{

  startCallback: ()=>void;
  updateCallback: (progress: number)=>void;
  endCallback: ()=>void;

  constructor(
    _startCallback: ()=>void,
    _updateCallback: (progress: number)=>void,
    _endCallback: ()=>void,
  ){
    this.startCallback = _startCallback;
    this.updateCallback = _updateCallback;
    this.endCallback = _endCallback;
  }

  tasks:{[taskId:string]: {
      loaded: number,
      total: number,
    }
  } = {}

  total: number = 0;

  public addTask = (data: {id: string, total: number}) => {

    if(Object.keys(this.tasks).length<=0){
      this.startCallback();
    }

    if(this.tasks[data.id]){return;}
    this.tasks[data.id] = {total:data.total, loaded: 0.0};
    
    // update total
    this.total = this.getTasksTotal();
  }

  public updateTask = (data: {id: string, loaded: number}) => {
    if(!this.tasks[data.id]){return;}
    this.tasks[data.id].loaded = data.loaded;

    const progress = (this.getTasksLoaded()/this.total);
    this.updateCallback( progress * 100.0 );

    if(progress >= 1.0){
      this.endCallback();
    }
  }

  private getTasksTotal = () => {
    let total = 0;
    for(const taskId in this.tasks){
      const task = this.tasks[taskId];
      total += task.total;
    }
    return total;
  }

  private getTasksLoaded = () => {
    let loaded = 0;
    for(const taskId in this.tasks){
      const task = this.tasks[taskId];
      loaded += task.loaded;
    }
    return loaded;
  }
}

export const loadGLTF = async(url: string, loadMeter?: Asset3DLoadMeter) => {
  const loader = new GLTFLoader();
  const loadTaskId = uuidv4();
  try{
    const gltf: GLTF = await loader.loadAsync(url, progress=>{
      loadMeter?.addTask({id: loadTaskId, total: progress.total});
      loadMeter?.updateTask({id: loadTaskId, loaded: progress.loaded});
    });
    return gltf.scene.children[0];
  }catch(err){
    console.error(err);
    throw new Error(`GLTF load failed with ${url}`);
  }
};

export const loadFBX = async(url: string, loadMeter?: Asset3DLoadMeter) => {
  const loader = new FBXLoader();
  const loadTaskId = uuidv4();
  try{
    const fbx: Group = await loader.loadAsync(url, progress=>{
      loadMeter?.addTask({id: loadTaskId, total: progress.total});
      loadMeter?.updateTask({id: loadTaskId, loaded: progress.loaded});
    });
    return fbx;
  }catch(err){
    console.error(err);
    throw new Error(`FBX load failed with ${url}`);
  }
}

export const loadTex = async(url: string) => {
  const loader = new TextureLoader();
  try{
    const tex: Texture = await loader.loadAsync(url);
    return tex;
  }catch(err){
    console.error(err);
    throw new Error(`Texture load failed with ${url}`);
  }
}

export const loadShader = async(url: string) => {
  const loader = new FileLoader();
  try{
    const shader: string | ArrayBuffer = await loader.loadAsync(url);
    return shader;
  }catch(err){
    console.error(err);
    throw new Error(`Shader load failed with ${url}`);
  }
}