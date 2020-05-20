import { BehaviorSubject } from "rxjs";

export class Filter {
    title: string

    column: string
    optionsSql: string
    type: string
    options: string
    values: string
    filterSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(undefined)
    selectedFilterValue: any

    static fromJSON(d: Object): Filter {
        let obj = Object.assign(new Filter(), d);
        return obj
    }
}