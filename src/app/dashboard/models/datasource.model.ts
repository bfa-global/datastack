import { DatasourceInfo } from "./datasource-info.model";
import { DatasourceOperation } from "./datasource-operation.model";
import { Endpoint } from "./endpoint.model";


export class Datasource {

    id: string
    openapi: string
    info: DatasourceInfo
    servers: Object[]
    paths: Object
    components: {
        "schemas": object,
        "parameters": object,
        "responses": object
    }

    getFirstBaseURL(): string {
        let url = (this.servers && this.servers.length > 0 && 'url' in this.servers[0]) ? this.servers[0]['url'] : undefined
        return url.endsWith('/') ? url.slice(0, -1) : url //remove trailing character if slash
    }

    static fromJSON(d: Object): Datasource {
        let obj = Object.assign(new Datasource(), d);
        obj.info = DatasourceInfo.fromJSON(d['info'])
        obj.paths = Object.keys(obj.paths).reduce((paths, key) => {
            paths[key] = Object.keys(obj.paths[key]).reduce((operations, method) => {
                operations[method] = DatasourceOperation.fromJSON(obj.paths[key][method])
                return operations
            }, {})
            return paths
        }, {})
        // obj.components = {
        //     schemas: Object.keys(d["components"]["schemas"]).reduce((acc, schemaKey) => {
        //         //TODO: Continue parsing schemas so they can be used by operations
        //         return acc
        //     }, {}),
        //     parameters: undefined,
        //     responses: undefined
        // }
        obj.components = {
            schemas: d["components"]["schemas"],
            parameters: undefined,
            responses: undefined
        }
        this.dereference(obj)
        return obj
    }

    static dereference(path) {
        //TODO Step through all response schemas populating 'allOf' records that have $ref
        //TODO with the response schemas populated, iterate through the paths to derefrence any response schemas referenced
    }

    endpointWithOperationWithID(operationId: string): Endpoint {
        let pathObjs = this.paths
        let paths = Object.keys(pathObjs)
        let endpoint = paths.reduce((endpoint: Endpoint, path) => {
            let foundEndpoint = this.findEndpointForPath(path, pathObjs, operationId)
            if (foundEndpoint) {
                endpoint = foundEndpoint
            }
            return endpoint
        }, undefined)
        return endpoint
    }

    findEndpointForPath(path: string, pathObjs: any, operationId: string): Endpoint {
        let pathObj = pathObjs[path]
        return Object.keys(pathObj).reduce((endpoint: Endpoint, method) => {
            let operation = pathObj[method]
            if (operation.operationId === operationId) {
                let endpointPath = this.getFirstBaseURL() + (path.startsWith('/') ? path : '/' + path)
                endpoint = {
                    path: endpointPath,
                    method: method,
                    operation: operation,
                }
            }
            return endpoint
        }, undefined)
    }

}