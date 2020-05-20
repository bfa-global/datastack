
export class DatasourceResponse {

    description: string
    content: Record<string, { schema: {} }>

    static fromJSON(d: Object): DatasourceResponse {
        let obj = Object.assign(new DatasourceResponse(), d);
        return obj
    }
}