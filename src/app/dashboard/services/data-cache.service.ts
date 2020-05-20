import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RequestOperation } from '../models/request-operation.model';
import { Response } from '../models/response.interface';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {

  data = new BehaviorSubject<{}>({});

  constructor() { }

  getCachedDataForRequest(request: RequestOperation, params: {}): Response {
    let paramDatapoints: Response = this.getAllCachedDatapointsForRequest(request)
    let responseData
    if (paramDatapoints && paramDatapoints.data && paramDatapoints.data.length) {
      responseData = this.getValuesForConditionsInParams(request, paramDatapoints.data, params)
    }
    return { data: responseData, metadata: { total_count: responseData ? responseData.length : 0 } }
  }

  getAllCachedDatapointsForRequest(request: RequestOperation): any {
    let dataValue = this.data.getValue()
    let paramDatapoints
    if (request.endpointKey in dataValue) {
      let endpointData = dataValue[request.endpointKey]
      if (request.paramKey in endpointData) {
        paramDatapoints = endpointData[request.paramKey]
      }
    }
    return paramDatapoints
  }

  getValuesForConditionsInParams(request: RequestOperation, dataPoints: any[], parameters: {}): any[] {
    let paramData = []

    // get the items matching range specified in data ref
    if (request.paramsHaveRange(parameters)) {
      let formattedMinValue
      let formattedMaxValue
      let formatter = undefined
      if (request.rangeIsTypeDate()) {
        let period = 'day'
        if ('period' in request.parameters) {
          period = request.parameters['period'].replace("ly", "")
        }
        let dateFormat = request.rangeFormat()
        formattedMinValue = moment(request.rangeMinValueFromParams(parameters), dateFormat).startOf(<moment.unitOfTime.StartOf>period)
        formattedMaxValue = moment(request.rangeMaxValueFromParams(parameters), dateFormat).endOf(<moment.unitOfTime.StartOf>period)
        let rangeDataMappingKey = request.operation.rangeDataMappingKey()
        formatter = (dataPoint) => {
          let date = moment(dataPoint[rangeDataMappingKey], dateFormat)
          return date
        }
      } else {
        console.error("Date parameter missing format", request.operation)
      }
      paramData = this.getValuesWithinConditions(dataPoints, formattedMinValue, formattedMaxValue, formatter)
    } else {
      // console.error("Range parameters missing", request.operation)
      return dataPoints;
    }
    return paramData
  }

  getValuesWithinConditions(datapoints: any[], startRange: moment.Moment, endRange: moment.Moment, formatter): any[] {
    let paramData = []
    for (let dataPoint of datapoints) {
      let formattedRangeValue = formatter ? formatter(dataPoint) : dataPoint
      if (formattedRangeValue >= startRange && formattedRangeValue <= endRange) {
        paramData.push(dataPoint)
      }
    }
    return paramData
  }

  mergeDataFromRequest(request: RequestOperation, data: any[], metadata: object) {

    let allData = this.data.getValue()

    let combinedDataFromEndpoint = {}
    let cachedParamDataFromEndpoint: Response = { data: [], metadata: {} }
    if (request.endpointKey in allData) {
      combinedDataFromEndpoint = allData[request.endpointKey]

      if (request.paramKey in combinedDataFromEndpoint) {
        cachedParamDataFromEndpoint = combinedDataFromEndpoint[request.paramKey]

        // find data and merge
        // find a range param and get mapped param name, iterate over data replacing values with same value for key

        for (let datapoint of data) {
          if (request.operation.rangeDataMappingKey) {
            let indexOfExistingObj = this.findWithAttr(cachedParamDataFromEndpoint.data, request.operation.rangeDataMappingKey(), datapoint[request.operation.rangeDataMappingKey()])
            if (indexOfExistingObj !== -1) {
              cachedParamDataFromEndpoint.data[indexOfExistingObj] = datapoint
            } else {
              // Merging: Adding new nonexistant datapoint to arary", datapoint, cachedParamDataFromEndpoint)
              cachedParamDataFromEndpoint.data.push(datapoint)
            }
          } else {
            console.warn("Merging: Critical error, can't merge because missing mapToResponse key")
          }
        }
        cachedParamDataFromEndpoint["metadata"] = { ...cachedParamDataFromEndpoint["metadata"], ...metadata }
      } else {
        // new request parameters for endpoint, save new dataset for new params
        // Merging: new request parameters for endpoint, save new dataset for new params", { data: data, metadata: metadata })
        cachedParamDataFromEndpoint = { data: data, metadata: metadata }
      }
    } else {
      // make new data for endpoint
      // Merging: Adding data to endpoint cache for first time", data, request.endpointKey, request.paramKey)
      cachedParamDataFromEndpoint = { data: data, metadata: metadata }
    }
    combinedDataFromEndpoint[request.paramKey] = cachedParamDataFromEndpoint
    allData[request.endpointKey] = combinedDataFromEndpoint
    this.data.next(allData)

  }

  findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

}
