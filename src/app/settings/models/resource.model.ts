export class Resource {

    _id: number
    name: string
    slug: string
    status: string


    constructor() {

    }

    static fromJSON(d: Object): Resource {
        let obj = Object.assign(new Resource(), d);
        return obj
    }
} 