import { DatasourceOperation } from "./datasource-operation.model";
import { DataReference } from "./data-reference.model";
import { Observer } from "rxjs";
import { Calculation } from "./calculation.enum";
import { CalculationsService } from "../services/calculations.service";
import { Response } from "./response.interface";
import { DatasourceOperationParameter } from "./datasource-operation-parameter.model";
import * as moment from 'moment';

export class RequestOperation {
    method: string
    endpoint: string
    operation: DatasourceOperation
    dataRef: DataReference
    parameters: object
    callbackObservers: DataReference[] = []
    endpointKey?: string
    paramKey?: string

    constructor(method: string, endpoint: string, dataRef: DataReference, operation: DatasourceOperation) {
        this.method = method
        this.endpoint = endpoint
        this.dataRef = dataRef
        this.operation = operation
        // this.dataRef.parameters = this.setLookupParameters(dataRef, operation)
        // this.parameters = { ...dataRef.parameters }
        this.parameters = this.setLookupParameters(dataRef, operation)
        this.endpointKey = this.endpointKeyForRequest(method, endpoint)
        this.paramKey = this.paramKeyFromRequest(dataRef, operation)
    }

    setLookupParameters(dataRef: DataReference, operation: DatasourceOperation): object {
        let params = { ...dataRef.parameters }
        let period = this.periodForParams(dataRef.parameters)

        let oldMinParam: DatasourceOperationParameter = operation.rangeMinParam()
        if (oldMinParam) {
            params[oldMinParam.name] = moment(dataRef.parameters[oldMinParam.name], oldMinParam.schema.format).startOf(<moment.unitOfTime.StartOf>period).format(oldMinParam.schema.format)

        }
        let oldMaxParam: DatasourceOperationParameter = operation.rangeMaxParam()
        if (oldMaxParam) {
            params[oldMaxParam.name] = moment(dataRef.parameters[oldMaxParam.name], oldMaxParam.schema.format).endOf(<moment.unitOfTime.StartOf>period).format(oldMaxParam.schema.format)
        }
        return params
    }


    endpointKeyForRequest(method, endpoint): string {
        return method + " " + endpoint
    }

    paramKeyFromRequest(dataRef: DataReference, operation: DatasourceOperation): string {
        //create a string that encapsulates non range parameters.
        //keys should be alphabatised to ensure seralization order matches future requests for the dataset
        let params = {}
        let requestKeys = Object.keys(dataRef.parameters).sort()
        for (let key of requestKeys) {
            let operationForKey = operation.operationParamForKey(key)
            if (operationForKey) {
                // check if key is part of range (has a schema option of lower-limit or upper limit)
                if (!operationForKey.isRange() && !operationForKey.isPagination()) {
                    params[key] = dataRef.parameters[key]
                }
            } else {
                console.warn("Found mismatched dataReference parameter key", key)
            }
        }
        let stringParams
        if (dataRef.requestBody) {
            stringParams = JSON.stringify({ "params": params, "requestBody": dataRef.requestBody })
        } else {
            stringParams = JSON.stringify(params)
        }
        return stringParams
    }

    extendRangeForDataRefCalculation(calcuationService: CalculationsService) {
        if (this.dataRef.calculation !== undefined) {
            //  calculating updated values
            let calculation: Calculation = Calculation[this.dataRef.calculation]
            if (this.paramsHaveRange(this.dataRef.parameters)) {
                if (this.rangeIsTypeDate()) {
                    let minValue = this.rangeMinValueFromParams(this.dataRef.parameters)
                    //TODO: Find out why Max value doesn't work date - this would be better option
                    let newMinValue = calcuationService.startDateForCalculation(calculation, minValue, this.rangeFormat())
                    this.parameters[this.minParam().name] = newMinValue ? newMinValue : minValue
                }
            }
        }
    }

    // Convenience Methods

    maxParam() {
        return this.operation.rangeMaxParam()
    }

    minParam() {
        return this.operation.rangeMinParam()
    }

    rangeMinValueFromParams(parameters: {}) {
        return parameters[this.minParam().name]
    }
    rangeMaxValueFromParams(parameters: {}) {
        return parameters[this.maxParam().name]
    }

    rangeFormat(): string {
        return this.maxParam().schema.format
    }

    periodForParams(parameters: {}): string {
        let period = 'day'
        if ('period' in parameters) {
            let paramPeriod: string = parameters['period']
            if (paramPeriod.includes("ly")) {
                if (paramPeriod.includes("daily")) {
                    period = "day"
                } else {
                    period = paramPeriod.replace("ly", "")
                }
            }
        }
        return period
    }

    // Conditionals
    rangeIsTypeDate(): boolean {
        return this.maxParam().schema.type === 'date' && "format" in this.maxParam().schema
    }

    paramsHaveRange(parameters): boolean {
        return this.maxParam() && this.minParam() && this.maxParam().name in parameters && this.minParam().name in parameters
    }

    paramsHavePagination(parameters): boolean {
        return this.operation.paginationPageLengthMappingKey() in parameters
    }
}
