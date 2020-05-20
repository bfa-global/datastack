import { DatasourceOperation } from "./datasource-operation.model";

export interface Endpoint {
    path: string,
    method: string,
    operation: DatasourceOperation
}