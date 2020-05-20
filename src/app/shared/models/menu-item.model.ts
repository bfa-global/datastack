import { PageSection } from "../../dashboard/models/dashboard-section.model";

export class MenuItem {
    icon: string
    title: string
    pageTitle: string
    href: string

    children: MenuItem[]
    layout: PageSection[]

    static fromJSON(d: Object): MenuItem {
        let obj = Object.assign(new MenuItem(), d);
        if ('children' in obj) {
            obj.children = d["children"].map(d => MenuItem.fromJSON(d))
        }
        return obj
    }

}

