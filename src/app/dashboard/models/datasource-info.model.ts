export class DatasourceInfo {

    version: string
    title: string
    description: string

    static fromJSON(d: Object): DatasourceInfo {
        let obj = Object.assign(new DatasourceInfo(), d);
        return obj;
    }

}