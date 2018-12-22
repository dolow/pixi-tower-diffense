import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class UiGraph {
    private static cachedFactory;
    static getFactory(type: string): UiNodeFactory | null;
}
