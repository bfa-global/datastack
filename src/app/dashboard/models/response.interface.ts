import { Error } from "../../shared/models/error.model";

export interface Response {
    data: any[],
    metadata: {},
    error?: Error
}