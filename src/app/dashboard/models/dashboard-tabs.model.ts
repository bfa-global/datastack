import { DashboardVisualization } from "./dashboard-visualization.model";
import { DashboardElement } from "./dashboard-element.model";

export class DashboardTabs extends DashboardElement {

    tabs: {
        title: string,
        visualization: DashboardVisualization
    }[]

    static fromJSON(d: Object): DashboardTabs {
        let obj = Object.assign(new DashboardTabs(), d);
        obj.tabs = d['tabs'].map(d => { return { "title": d.title, "visualization": DashboardVisualization.fromJSON(d.visualization) } })
        return obj
    }
}