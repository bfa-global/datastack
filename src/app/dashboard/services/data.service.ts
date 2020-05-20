import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Datasource } from '../models/datasource.model';
import { DataReference } from '../models/data-reference.model';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DatasourceOperationParameter } from '../models/datasource-operation-parameter.model';
import { RequestOperation } from '../models/request-operation.model';
import { Error } from '../../shared/models/error.model';
import { CalculationsService } from './calculations.service';
import { DatasourceService } from './datasource.service';
import { DataCacheService } from './data-cache.service';
import { Response } from '../models/response.interface';
import * as moment from 'moment';
import * as d3 from "d3";
import { BigqueryParserService } from '../../shared/services/bigquery-parser.service';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  pendingRequests = {}
  timeLastLoaded: Date

  constructor(
    public datasourceService: DatasourceService,
    public authService: AuthService,
    public http: HttpClient,
    public calcuationService: CalculationsService,
    public dataCacheService: DataCacheService,
    public bigqueryParserService: BigqueryParserService
  ) { }

  getDataOrScheduleRequestForDataref(dataRef: DataReference) {
    // Make sure datasource information is available
    this.datasourceService.datasources.pipe(
      filter(datasource => datasource !== undefined)
    ).subscribe((datasources: Datasource[]) => {
      let request: RequestOperation = this.createRequestFromDataRef(dataRef)
      if (!request) {
        console.warn("Could not get request!", datasources, dataRef)
      }

      // --- Cacheing temporarily disabled due to missing data from datasets --
      // If data not in cache, add pending network request to populate cache
      let cachedData: Response
      // Paginated Data isn't cached
      // if (!request.paramsHavePagination(request.dataRef.parameters)) {
      //   cachedData = this.dataCacheService.getCachedDataForRequest(request, request.parameters)
      // }
      if (!(cachedData && cachedData.data && cachedData.data.length ? true : false)) {
        this.schedulePendingRequest(request)
      } else {
        this.publishDataForRequestCallbacks(request, cachedData)
      }
    })
  }

  createRequestFromDataRef(dataRef: DataReference): RequestOperation {
    let request: RequestOperation = this.getRequestOperationForDataReference(dataRef)

    if (dataRef.dataSubject) {
      request.callbackObservers.push(dataRef)
    }

    // Check and update ranges to ensure apprpriate range of data is requested for calcuation
    request.extendRangeForDataRefCalculation(this.calcuationService)
    return request
  }

  getRequestOperationForDataReference(dataRef: DataReference): RequestOperation {
    let request: RequestOperation
    if (this.datasourceService.datasourceContainsReference(dataRef)) {
      let datasourceFromDatasource = this.datasourceService.datasourceMatchingReference(dataRef)
      request = this.requestFromDatasource(dataRef, datasourceFromDatasource)
    } else {
      console.warn("Datasource \"", dataRef.dataSourceId, "\" with id \"", dataRef.operationId, "\" is not an avaialble datasource")
    }
    return request
  }

  requestFromDatasource(dataRef: DataReference, datasource: Datasource): RequestOperation {
    let request
    let endpoint = datasource.endpointWithOperationWithID(dataRef.operationId)
    if (endpoint) {
      request = new RequestOperation(endpoint.method, endpoint.path, dataRef, endpoint.operation)
    } else {
      console.warn("Endpoint \"", endpoint, "\" with id \"", dataRef.operationId, "\" is not an avaialble datasource", dataRef)
    }
    return request
  }

  schedulePendingRequest(pendingRequest: RequestOperation) {
    // if requested data from one completley overlaps other, ensure more broad request says schedule
    let paramKey: string = pendingRequest.paramKey
    console.log("param key", paramKey)
    console.log("pendingRequest", pendingRequest)
    if (pendingRequest.endpoint in this.pendingRequests) {
      console.log("this.pendingRequests", this.pendingRequests)
      let pendingRequestsForEndpoint = this.pendingRequests[pendingRequest.endpoint]
      // if a request with the same endpoint already exists, check params
      if (paramKey in pendingRequestsForEndpoint) {
        let pendingRequestWithMatchingParams = pendingRequestsForEndpoint[paramKey]
        // if request with params already exist, make adjustments based on range

        let oldMinParam: DatasourceOperationParameter = pendingRequestWithMatchingParams.operation.rangeMinParam()
        let oldMaxParam: DatasourceOperationParameter = pendingRequestWithMatchingParams.operation.rangeMaxParam()
        let newMinParam: DatasourceOperationParameter = pendingRequest.operation.rangeMinParam()
        let newMaxParam: DatasourceOperationParameter = pendingRequest.operation.rangeMaxParam()
        if (oldMaxParam && oldMaxParam.name in pendingRequestWithMatchingParams.parameters && oldMinParam.name in pendingRequestWithMatchingParams.parameters && newMaxParam.name in pendingRequest.parameters && newMinParam.name in pendingRequest.parameters) {
          if (oldMaxParam.schema.type === 'date' && newMaxParam.schema.type === 'date') {
            if ("format" in oldMaxParam.schema && "format" in newMaxParam.schema) {
              let period = pendingRequest.periodForParams(pendingRequest.parameters)
              let oldDateFormat = oldMaxParam.schema.format
              let newDateFormat = newMaxParam.schema.format
              let formattedOldMinValue = moment(pendingRequestWithMatchingParams.parameters[oldMinParam.name], oldDateFormat).startOf(<moment.unitOfTime.StartOf>period)
              let formattedOldMaxValue = moment(pendingRequestWithMatchingParams.parameters[oldMaxParam.name], oldDateFormat).endOf(<moment.unitOfTime.StartOf>period)
              let formattedNewMinValue = moment(pendingRequest.parameters[newMinParam.name], newDateFormat).startOf(<moment.unitOfTime.StartOf>period)
              let formattedNewMaxValue = moment(pendingRequest.parameters[newMaxParam.name], newDateFormat).endOf(<moment.unitOfTime.StartOf>period)

              //TODO: check if there is no overlap in ranges and schedule seperate requests... probably means having arrays for each param group
              if (formattedNewMinValue < formattedOldMinValue) {
                pendingRequestWithMatchingParams.parameters[oldMinParam.name] = pendingRequest.parameters[newMinParam.name]
              }

              if (formattedNewMaxValue > formattedOldMaxValue) {
                pendingRequestWithMatchingParams.parameters[oldMaxParam.name] = pendingRequest.parameters[newMaxParam.name]
              }

            }
          }
        }

        for (let observer of pendingRequest.callbackObservers) {
          pendingRequestWithMatchingParams.callbackObservers.push(observer)
        }

      } else {
        //set new request with specified parameters
        pendingRequestsForEndpoint[paramKey] = pendingRequest
      }
      //save updates to all pending requests
      this.pendingRequests[pendingRequest.endpoint] = pendingRequestsForEndpoint
    } else {
      // add a new endpoint to the pending requests
      let newPendingRequest = {}
      newPendingRequest[paramKey] = pendingRequest
      this.pendingRequests[pendingRequest.endpoint] = newPendingRequest
    }
  }

  executePendingRequestOperations() {
    for (let endpointKey of Object.keys(this.pendingRequests)) {
      for (let paramKey of Object.keys(this.pendingRequests[endpointKey])) {
        this.executePendingRequest(this.pendingRequests[endpointKey][paramKey])
        delete this.pendingRequests[endpointKey][paramKey]
      }
      delete this.pendingRequests[endpointKey]
    }

    // clear pending requests after they have been queued and no longer pending
    this.pendingRequests = {}
  }

  executePendingRequest(request: RequestOperation, hasRun = false) {

    // cache token so don't need to call fetch token and execute request
    var isBigqueryRequest = request.endpoint.includes("bigquery.googleapis.com")
    var isLoadedToken = 'Authorization' in request.parameters ? request.parameters['Authorization'].includes('{authentication_token}') : true

    if (isBigqueryRequest && !isLoadedToken && !hasRun) {
      this.authService.getBigQueryToken().then(access_token => {
        request.parameters['Authorization'] = request.parameters['Authorization'].replace('{bigquery-authorization}', access_token)
        console.log('replaced auth', request.parameters['Authorization'])
        this.executePendingRequest(request, true)
      }).catch(error => {
        console.debug(error)
      })
    } else {
      let options = this.optionsForRequest(request)

      if (request.method.toLowerCase() === "post" && "requestBody" in request.dataRef) {
        options["body"] = this.postBodyForRequest(request)
      }

      let endpoint = request.endpoint
      if ("path" in options) {
        // Swap out path variables for parameters before request is made
        let pathOptions = options["path"]
        for (let pathKey of Object.keys(pathOptions)) {
          let replacementKey = "{" + pathKey + "}"
          endpoint = endpoint.replace(replacementKey, pathOptions[pathKey])
        }
      }

      let resp: Response = {
        data: undefined,
        metadata: undefined
      }

      this.http.request(request.method, endpoint, options).subscribe(response => {
        let responseStructure = this.getResponseStructure(request, response["status"].toString())
        if ("dataPath" in responseStructure && responseStructure["dataPath"] in response["body"]) {
          let dataPathKey = responseStructure["dataPath"]
          let responseBody = response["body"]
          resp.data = responseBody[dataPathKey]

          //TODO: Generalize
          if (endpoint.includes("bigquery.googleapis.com")) {
            resp.data = this.bigqueryParserService.mergeSchemaWithRows(responseBody["schema"], resp.data)
            console.log(resp.data)
          }

          resp.metadata = {
            //TODO Make dynamic from datasource defintion
            "total_count": responseBody["total_count"]
          }
          // Don't cache if paginated data
          if (!request.paramsHavePagination(request.dataRef.parameters)) {
            // this.dataCacheService.mergeDataFromRequest(request, resp.data, resp.metadata)
          }
          this.publishDataForRequestCallbacks(request, resp)
        } else {
          resp.error = Error.generic(400)
          this.publishDataForRequestCallbacks(request, resp)
        }
      }, error => {
        console.warn("Error", error)
        this.authService.detectLogoutCondition(error)
        resp.error = Error.fromCode(error.status)
        this.publishDataForRequestCallbacks(request, resp)
      })
    }
  }

  optionsForRequest(request: RequestOperation): object {
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      observe: 'response'
    }

    request.operation.parameters.forEach(param => {
      if (param.in === "header") {
        let value = (param.name in request.parameters) ? this.dereferencedParamValue(request.parameters[param.name], undefined, request.dataRef) : undefined
        if (param.required || value) {
          let headers = options["headers"]
          headers = headers.set(param.name, value)
          options["headers"] = headers
        }
      } else if (param.in === "query") {
        let value = (param.name in request.parameters) ? this.dereferencedParamValue(request.parameters[param.name], undefined, request.dataRef) : undefined
        if (param.required || value) {
          let params = options["params"]
          if (!params) {
            params = new HttpParams()
          }
          params = params.set(param.name, value)
          options["params"] = params
        }
      } else if (param.in === "path") {
        let value = (param.name in request.parameters) ? this.dereferencedParamValue(request.parameters[param.name], undefined, request.dataRef) : undefined
        if (param.required || value) {
          let path = options["path"]
          if (!path) {
            path = {}
          }
          path[param.name] = value
          options["path"] = path
        }
      } else if (param.in === "cookie") {
        //TODO: Handle value in cookie
      } else if (param.in === "body") {
        //body is not officially supported as part of OAS3.0
        // Deprecated
        let value = (param.name in request.parameters) ? this.dereferencedParamValue(request.parameters[param.name], param, request.dataRef) : undefined
        if (param.required || value) {
          let body = options["body"]
          if (!body) {
            body = {}
          }
          body[param.name] = value
          options["body"] = body
        }
      }
    });
    return options
  }

  postBodyForRequest(request: RequestOperation) {
    //get the content type (application/json)
    // console.log("Request", request)
    const ref = request.operation.requestBody["content"]["application/json"]["schema"]["$ref"]
    // console.log("Ref", ref)
    let body = request.dataRef.requestBody
    const component = this.getComponentForRef(ref, request)
    // console.log("Body", body)

    body = this.formatBodyValue(body, component, request)
    return body
  }

  getComponentForRef(ref: string, request: RequestOperation) {
    const dataSource = this.datasourceService.datasourceMatchingReference(request.dataRef)
    let refPath = ref.split('/')
    if (refPath.indexOf("#") === 0) {
      refPath.splice(0, 1)
      console.log(refPath)
    }

    let componnent = refPath.reduce((a, c) => {
      return a[c]
    }, dataSource)

    console.log(componnent)
    console.log(dataSource)
    return componnent

  }

  formatBodyValue(value, component, request) {
    if (typeof value !== component.type) {
      console.warn(value, "is not of the specificed type", component.type);
    }

    Object.keys(component.properties).map(key => {
      // console.log("checking for key", key)
      if (key in value) {

        if ("$ref" in component.properties[key]) {
          let thisComp = this.getComponentForRef(component.properties[key]["$ref"], request)
          value[key] = this.formatBodyValue(value[key], thisComp, request)
        } else if (component.properties[key].type === 'array' && "$ref" in component.properties[key].items) {
          console.log("Found type array", component.properties[key].items)
          let thisComp = this.getComponentForRef(component.properties[key].items["$ref"], request)
          value[key].forEach((item, index) => {
            value[key][index] = this.formatBodyValue(item, thisComp, request)
          })
        } else {
          console.log("Found key", key, "with value", value[key], "with type", typeof value[key])
          if ("format" in component.properties[key]) {
            console.log("before setting date", value[key])
            value[key] = moment(value[key]).format(component.properties[key]["format"]);
            console.log("after setting date", value[key])

          }
          // if (typeof value[key] = )
        }

      }
    })
    return value
  }

  getResponseStructure(request, responseCode) {
    let responseStructure
    if (responseCode in request.operation["responses"]) {
      responseStructure = request.operation["responses"][responseCode]
    } else if ("default" in request.operation["responses"]) {
      responseStructure = request.operation["responses"]["default"]
    }
    return responseStructure
  }

  publishDataForRequestCallbacks(request: RequestOperation, response: Response) {
    for (let dataRef of request.callbackObservers) {

      // Create a new response object copy with a copy of the so filters to data are not obsevered by other request
      // callbacks and calcualtions do not carry over to other responses
      let data = response.data ? response.data.map(d => { return { ...d } }) : undefined
      let callbackSpecificResponse = { data: data, metadata: response.metadata, error: response.error }

      if (!callbackSpecificResponse.error) {
        // get extended date range for calculations
        let dataForReference = this.dataCacheService.getValuesForConditionsInParams(request, callbackSpecificResponse.data, request.parameters)
        callbackSpecificResponse.data = dataForReference
        if (callbackSpecificResponse.data && callbackSpecificResponse.data.length) {

          if (dataRef.hasDisplayValue()) {
            callbackSpecificResponse.data = callbackSpecificResponse.data.map(d => {
              d.displayValue = dataRef.displayValueForDataPoint(d)
              return d
            })
          }

          // run requested calculations on data
          if (dataRef.hasCalculation()) {
            callbackSpecificResponse.data = this.calcuationService.calculate(dataRef, callbackSpecificResponse.data)
          }

          // return only values from non-extended date range
          callbackSpecificResponse.data = this.dataCacheService.getValuesForConditionsInParams(request, callbackSpecificResponse.data, dataRef.parameters)

          // sort the data before returning
          callbackSpecificResponse.data = this.sortDataByRequest(callbackSpecificResponse.data, request)
        }
      } else {
        console.warn("Warining - received ", callbackSpecificResponse.error)
      }
      dataRef.dataSubject.next(callbackSpecificResponse)
      this.timeLastLoaded = new Date()
    }
  }

  // Sorting

  sortDataByRequest(data: any[], request: RequestOperation, asc?: boolean): any[] {
    asc = asc === undefined ? true : asc
    if (request.paramsHaveRange(request.parameters)) {
      if (request.rangeIsTypeDate()) {
        data = this.sortDataByDate(data, request.operation.rangeDataMappingKey(), request.rangeFormat(), asc)
      } else {
        console.warn("Sorting range is not type date")
      }
    } else {
      console.warn("Sorting by request that does not have an order")
    }
    return data
  }

  sortDataByDate(data: any[], key, format: string, asc: boolean): any[] {
    return data.sort((a, b) => {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = moment(a[key], format)
      const varB = moment(b[key], format)

      let comparison = 0;
      if (varA.isAfter(varB)) {
        comparison = 1;
      } else if (varA.isBefore(varB)) {
        comparison = -1;
      }

      return (
        (asc === false) ? (comparison * -1) : comparison
      );
    })
  }



  // Substitution

  dereferencedParamValue(derefValue, param?: DatasourceOperationParameter, dataRef?: DataReference) {
    let value = derefValue

    if (derefValue instanceof BehaviorSubject) {
      value = (derefValue as BehaviorSubject<any>).getValue()
    } else if (typeof (derefValue) === "string") {
      if (derefValue.includes("{authentication_token}")) {
        if (this.authService.getStoredAuth()) {
          value = derefValue.replace("{authentication_token}", this.authService.getStoredAuth().token)
        } else {
          value = undefined //unset value so substituation isn't returned
        }
      } else if (derefValue.includes("{current-day}")) {
        value = derefValue.replace("{current-day}", this.formattedParam(param))
      } else if (dataRef.dashboardScope && dataRef.dashboardScope["dataItem"] !== undefined) {
        //see if value is in the dashboard's passed in params
        for (let key of Object.keys(dataRef.dashboardScope["dataItem"])) {
          console.log("key", key, derefValue)
          if (derefValue === "{" + key + "}") {
            value = this.formattedParam(param, dataRef.dashboardScope["dataItem"][key])
          }
        }
      }
    } else {
      console.log("Deref", derefValue, param, dataRef)

    }
    return value
  }

  formattedParam(param: DatasourceOperationParameter, value?): string {
    if (param && 'schema' in param) {
      let schema = param['schema']
      if (schema.type === "date" && 'format' in schema) {
        value = new Date()
        let format = schema.format
        value = moment(value).format(format);
      } else if (schema.type === "string" && 'format' in schema) {
        value = d3.format(schema.format)(value)
      }
    }
    return value
  }

}
