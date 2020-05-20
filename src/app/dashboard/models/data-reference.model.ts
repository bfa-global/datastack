import { BehaviorSubject } from "rxjs";
import { Response } from '../models/response.interface';

export class DataReference {

    dataSourceId: string // the id of the api to use
    operationId: string // the operation to perform. ex: GET /users 
    parameters: object  // values to include with the request
    requestBody: any // body to include with requet
    displayValue: string  // values to used from the result
    calculation: string // determines how the result values are transformed to get the expected result
    dataSubject: BehaviorSubject<Response> = new BehaviorSubject<Response>(undefined);
    dashboardScope: object // the scope of the data provided to the dashboard (dataItem)

    constructor(dataSourceId?: string,
        operationId?: string,
        parameters?: object,
        displayValue?: string,
        calculation?: string) {
        this.dataSourceId = dataSourceId
        this.operationId = operationId
        this.parameters = parameters
        this.displayValue = displayValue
        this.calculation = calculation
    }
    static fromJSON(d: Object): DataReference {
        let obj = Object.assign(new DataReference(), d);
        return obj
    }

    evaluateDataValue(datapoint: object): number {
        let evalStatement = this.displayValue
        Object.keys(datapoint).forEach((key) => {
            if (evalStatement.includes(key)) {
                evalStatement = evalStatement.replace(key, datapoint[key])
            }
        })
        let completedEvaluation = eval(evalStatement)
        return completedEvaluation
    }

    hasCalculation(): boolean {
        return 'calculation' in this && this.calculation !== undefined && this.calculation !== null;
    }

    hasDisplayValue(): boolean {
        return 'displayValue' in this && this.displayValue !== undefined && this.displayValue !== null && this.displayValue !== '';
    }

    displayValueForDataPoint(dataPoint: object) {
        let displayValue
        if (this.hasCalculation()) {
            displayValue = dataPoint[this.calculation]
        } else if (this.hasDisplayValue()) {
            displayValue = this.evaluateDataValue(dataPoint)
        } else {
            displayValue = dataPoint
        }
        return displayValue
    }

}

