import Event from 'interfaces/UiGraph/Event';
export default interface Node {
    id: string;
    type: string;
    position: number[];
    children: Node[];
    params?: {
        [key: string]: any;
    };
    events?: Event[];
}
