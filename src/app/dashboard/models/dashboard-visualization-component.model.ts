import { DataReference } from "./data-reference.model";
import { DashboardElement } from "./dashboard-element.model";

export class DashboardVisualizationComponent extends DashboardElement {

    id: string
    options: any
    dataRefs: DataReference[]

    static fromJSON(d: Object): DashboardVisualizationComponent {
        let obj = Object.assign(new DashboardVisualizationComponent(), d);
        if ('dataRefs' in obj) {
            obj.dataRefs = d['dataRefs'].map((dataRef) => DataReference.fromJSON(dataRef))
        }
        return obj
    }
}