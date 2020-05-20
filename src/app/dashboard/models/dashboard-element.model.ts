
export class DashboardElement {

    type: string
    classes: string

    static fromJSON(d: Object): DashboardElement {
        let obj = Object.assign(new DashboardElement(), d);
        return obj
    }
}