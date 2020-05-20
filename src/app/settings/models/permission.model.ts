export class Permission {

    _id: number
    name: string
    resourceRole: string
    slug: string
    status: string

    constructor() {

    }

    static fromJSON(d: Object): Permission {
        let obj = Object.assign(new Permission(), d);
        return obj
    }
} 