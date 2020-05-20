import { DatasourceOperationParameter } from "./datasource-operation-parameter.model";
import { DatasourceResponse } from "./datasource-operation-response.model";

export class DatasourceOperation {

    path: string
    method: string
    description: string
    operationId: string
    requestBody: {
        description:string,
        required: boolean,
        content:object
    }
    parameters: DatasourceOperationParameter[]
    responses: Record<string, DatasourceResponse> = {}

    static fromJSON(d: Object): DatasourceOperation {
        let obj = Object.assign(new DatasourceOperation(), d);
        obj.parameters = d['parameters'].map(d => DatasourceOperationParameter.fromJSON(d))

        let responses = d['responses']
        Object.keys(responses).forEach(key => {
            obj.responses[key] = DatasourceResponse.fromJSON(responses[key])
        })
        return obj
    }

    operationParamForKey(key: string): DatasourceOperationParameter {
        return this.paramMatchingCondition((param) => {
            return param.name === key
        })
    }

    rangeDataMappingKey(): string {
        return this.paramMatchingCondition(param => {
            return param.isRange() && "mapsToInResponse" in param
        })['mapsToInResponse']
    }

    paginationPageNumber(): object {
        return this.paramMatchingCondition(param => {
            return param.isPaginationPageNumber()
        })
    }

    paginationPageNumberMappingKey(): string {
        return this.paginationPageNumber()['name']
    }

    paginationPageLengthMappingKey(): string {
        let param = this.paramMatchingCondition(param => {
            return param.isPaginationPageLength() && "name" in param
        })
        return param ? param['name'] : undefined
    }

    rangeMaxParam(): DatasourceOperationParameter {
        return this.paramMatchingCondition((param: DatasourceOperationParameter) => param.isMaxRange())
    }

    rangeMinParam(): DatasourceOperationParameter {
        return this.paramMatchingCondition((param: DatasourceOperationParameter) => param.isMinRange())
    }

    paramMatchingCondition(condition): any {
        let paramMatchingCondition = undefined
        for (let opParam of this.parameters) {
            if (condition(opParam)) {
                paramMatchingCondition = opParam
            }
        }
        return paramMatchingCondition
    }
}
