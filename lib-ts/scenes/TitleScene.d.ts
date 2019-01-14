import Scene from 'scenes/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    constructor();
    /**
     * ゲーム開始ボタンが押下されたときのコールバック
     */
    onGameStartTappedDown(): void;
    /**
     * ゲーム開始ボタン押下が離されたされたときのコールバック
     */
    onGameStartTappedUp(): void;
}
