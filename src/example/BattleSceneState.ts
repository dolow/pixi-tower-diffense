/**
 * BattleScene のステート
 */
const BattleSceneState = Object.freeze({
  LOADING_RESOURCES: 1,
  RESOURCE_LOADED: 2,
  READY: 3,
  INGAME: 4,
  FINISHED: 5
});

export default BattleSceneState;
