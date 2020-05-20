import { DashboardElement } from "./dashboard-element.model";
import { DashboardVisualizationComponent } from "./dashboard-visualization-component.model";

export class DashboardElementGroup extends DashboardElement {

    id: string
    components: Array<DashboardElementGroup | DashboardVisualizationComponent>

    constructor() {
        super()
    }

    static fromJSON(d: Object): DashboardElementGroup {
        let obj = Object.assign(new DashboardElementGroup(), d);
        obj.components = d['components'].map(d => d.type === 'group' ? DashboardElementGroup.fromJSON(d) : DashboardVisualizationComponent.fromJSON(d))

        return obj
    }
}