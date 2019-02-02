import Scene from 'example/Scene';
/**
 * タイトルシーン
 */
export default class SecondScene extends Scene {
    private text;
    private count;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * 毎フレームの更新処理
     */
    update(dt: number): void;
    /**
     * 次のシーンへの遷移
     */
    nextScene(): void;
}
