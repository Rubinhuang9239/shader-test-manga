import { SceneUtils } from "../App";

export const initStatsUtils = (element?: HTMLElement) => {
  (element ? element : document.body).appendChild( SceneUtils.stats.dom );
  SceneUtils.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  SceneUtils.stats.dom.style.position = 'absolute';
  SceneUtils.stats.dom.style.opacity = '0.75';
}