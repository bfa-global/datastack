export class Department {

    _id: number
    name: string
    slug: string
    createdAt: string
    updatedAt: string
    description: string

    constructor() {

    }

    static fromJSON(d: Object): Department {
        let obj = Object.assign(new Department(), d);
        return obj
    }
} 