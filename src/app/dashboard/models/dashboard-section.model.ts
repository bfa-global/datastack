import { DashboardVisualization } from "./dashboard-visualization.model";
import { DashboardTabs } from "./dashboard-tabs.model";
import { DashboardElement } from "./dashboard-element.model";
import { DashboardElementGroup } from "./dashboard-element-group.model";

export class PageSection {
    title: string
    left: string
    right: string
    carousel: boolean = false
    elements: Array<DashboardElement | DashboardElementGroup | DashboardVisualization | DashboardTabs> = []

    static fromJSON(d: Object): PageSection {
        let obj = Object.assign(new PageSection(), d);
        if ('elements' in obj) {
            obj.elements = obj['elements'].map(d => d.type === "tabs" ? DashboardTabs.fromJSON(d) : DashboardVisualization.fromJSON(d))
        }
        return obj
    }
}