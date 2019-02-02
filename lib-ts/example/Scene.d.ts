import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * ゲームシーンの抽象クラス
 * UiGraph を利用して UI 情報を透過的に読み込み初期化する
 * また、シーン間のトランジションイベントを提供する
 * いずれのイベントも実装クラスにて独自処理の実装を行うことができる
 */
export default abstract class Scene extends PIXI.Container {
    /**
     * GameManager によって requestAnimationFrame 毎に呼び出されるメソッド
     */
    update(_delta: number): void;
    /**
     * 更新処理を行うべきオブジェクトとして渡されたオブジェクトを登録する
     */
    protected registerUpdatingObject(_object: UpdateObject): void;
    /**
     * 更新処理を行うべきオブジェクトを更新する
     */
    protected updateRegisteredObjects(_delta: number): void;
    /**
     * シーン追加トランジション開始
     * 引数でトランジション終了時のコールバックを指定できる
     */
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
    /**
     * シーン削除トランジション開始
     * 引数でトランジション終了時のコールバックを指定できる
     */
    beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void;
}
