/**
 * BattleScene のステート
 */
declare const BattleSceneState: Readonly<{
    LOADING_RESOURCES: number;
    RESOURCE_LOADED: number;
    READY: number;
    INGAME: number;
    FINISHED: number;
}>;
export default BattleSceneState;
