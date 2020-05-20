export class Setting {

    _id: number
    key: string
    value: string
    slug: string

    constructor() {

    }

    static fromJSON(d: Object): Setting {
        let obj = Object.assign(new Setting(), d);
        try {
            obj.value = JSON.parse(obj.value)
        } catch (error) {

        }
        return obj
    }
} 