import UpdateObject from 'display/UpdateObject';
export default class BattleResult extends UpdateObject {
    animationEnded: boolean;
    onAnimationEnded: () => void;
    private sprite;
    static readonly resourceList: string[];
    constructor(win: boolean);
    update(_delta: number): void;
}
