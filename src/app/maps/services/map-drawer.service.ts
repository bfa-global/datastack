import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapLayerService } from './map-layer.service';
import { filter } from 'rxjs/operators';
import { MapLayer } from '../models/layer.model';
import { environment } from '../../../environments/environment';
import { VegaChart } from '../models/vega-chart.model';
import { VegaChartType } from '../models/vega-chart-type.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BigqueryParserService } from '../../shared/services/bigquery-parser.service' 
import { AuthService } from '../../auth/auth.service' 

@Injectable({
  providedIn: 'root'
})
export class MapDrawerService {

  hideDrawer: boolean = false;
  tabsDataArray = new BehaviorSubject<Object[]>([]) // array (that maps to tabs) of data objects (which map to charts within a tab)
  visualizedLayers = []

  constructor(
    public http: HttpClient,
    public mapLayerService: MapLayerService,
    public bigqueryParserService: BigqueryParserService,
    public authService: AuthService,
  ) {
    // when active SelectableLayers change, update this
    this.mapLayerService.activeSelectableLayers.pipe(
      filter(layer => layer !== undefined)
    ).subscribe((layers: MapLayer[]) => {
      this.visualizedLayers.forEach(l => {
        // remove old visualizations and tabs
        if (!this.containsLayer(layers, l)) {
          this.visualizedLayers.splice(this.visualizedLayers.indexOf(l), 1)

          let tabsData = this.tabsDataArray.getValue()
          tabsData = tabsData.filter(obj => obj['title'] !== l.title)
          this.tabsDataArray.next(tabsData)
        }
      })
      layers.forEach((l) => {
        // Only create new tabs for new data
        if (!this.containsLayer(this.visualizedLayers, l)) {
          this.createTabFromLayer(l)
        }
      })
    })
  }

  toggleDrawer(): void {
    this.hideDrawer = !this.hideDrawer;
  }

  createTabFromLayer(l: MapLayer) {
    if (l.datasource === "carto") {
      this.http.get(
        environment.cartoCredentials.apiUrl + "/sql?api_key=" + environment.cartoCredentials.apiKey + "&q=" + l.sql,
        { observe: 'response' },
      ).subscribe(
        (response) => {
          if (response['status'] === 200) {
            // Parse response into data for new tab
            let newTabData = {
              title: l.title,
              data: {},
              charts: {},
            }

            // Cycle each row, which contains values for each field
            response['body']['rows'].forEach(row => {

              // Cycle through each field within a row, processing and extracting the values
              Object.keys(response['body']['fields']).forEach((field, i) => {

                // process data that has multiple values in one cell
                let value = row[field]

                let isAgg = l.selectableVisualizationTypes[i] === "agg-bar"
                if (isAgg) {
                  let replacementValueArray = []
                  value = value.replace("{", "[").replace("}", "]") // hack to fix bad data in field dg5
                  let jsonArr = JSON.parse(value);
                  jsonArr.forEach((subvalue) => {
                    if (subvalue !== "") {
                      replacementValueArray.push(subvalue)
                    }
                  })
                  value = replacementValueArray
                }

                // add all the data to the field's chart
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    value.forEach(val => {
                      newTabData = this.newTabDataForValue(field, val, newTabData, l, i, isAgg)
                    })
                  }
                } else {
                  newTabData = this.newTabDataForValue(field, value, newTabData, l, i, isAgg)
                }
              })
            });

            // Add the data to all the tabs and notify
            let allTabData = this.tabsDataArray.getValue()
            if (allTabData.length > 0) {
              allTabData.push(newTabData)
            } else {
              allTabData = [newTabData]
            }
            this.tabsDataArray.next(allTabData)
            this.visualizedLayers.push(l)
          } else {
            console.warn("Error parsing carto query response")
          }
        }, (errorResponse) => {
          console.warn("Error", errorResponse)
        },
      )
    } else {
      this.authService.getBigQueryToken().then(access_token=>{
        this.queryBigQueryAPI(l.sql, 
          (allTabData) => {
            // Notify that tab data has been updated
            this.tabsDataArray.next(allTabData)
            this.visualizedLayers.push(l)
          },
          (response) => {
            // Parse response into data for new tab
            let newTabData = {
              title: l.title,
              data: {},
              charts: {},
            }

            // Cycle each row, which contains values for each field
            response.data = this.bigqueryParserService.mergeSchemaWithRows(response["schema"], response["rows"])
            
            response.data.forEach(row => {

              // Cycle through each field within a row, processing and extracting the values
              response['schema']['fields'].forEach((fieldobj, i) => {
                // parse out the name of the field from bigquery's schema object
                let field = fieldobj['name']

                // process data that has multiple values in one cell
                let value = row[field]

                let isAgg = l.selectableVisualizationTypes[i] === "agg-bar"
                if (isAgg) {
                  let replacementValueArray = []
                  let jsonArr = JSON.parse(value);
                  jsonArr.forEach((subvalue) => {
                    if (subvalue !== "") {
                      replacementValueArray.push(subvalue)
                    }
                  })
                  value = replacementValueArray
                }

                // add all the data to the field's chart
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    value.forEach(val => {
                      newTabData = this.newTabDataForValue(field, val, newTabData, l, i, isAgg)
                    })
                  }
                } else {
                  newTabData = this.newTabDataForValue(field, value, newTabData, l, i, isAgg)
                }
              })
            });

            // Add the data to all the tabs
            let allTabData = this.tabsDataArray.getValue()
            if (allTabData.length > 0) {
              allTabData.push(newTabData)
            } else {
              allTabData = [newTabData]
            }
            return allTabData
          },
        )
      }).catch(error=>{
        console.debug(error)
      })
    }
  }

  queryBigQueryAPI(query, callback, parser, ) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.bigQueryAccessToken
      })
    }

    const body = { "query": query, "useLegacySql": false }

    this.http.post(
      environment.bigQueryCredentials.apiUrl + '/projects/' + environment.bigQueryCredentials.projectName + '/queries',
      body,
      httpOptions
    ).subscribe(
      (response) => {
        
        if (response && 'rows' in response && 'schema' in response) {
          let allTabData = parser(response)
          callback(allTabData)
        } else {
          console.warn("Error parsing query", query)
        }
      }, (errorResponse) => {
        console.warn("Error", errorResponse)
      },
    )
  }

  newTabDataForValue(field, value, newTabData, l, i, isAgg) {
    if (!newTabData['data'][field]) {
      // if this is the first value being added to the field's chart, set up the arrays
      newTabData['data'][field] = [value]
      newTabData['charts'][field] = VegaChart.fromJSON({
        id: field,
        title: l.selectableVisualizationTitles[i],
        type: VegaChartType.BarChart,
        fieldName: field,
        data: [value],
        agg: isAgg,
        sourceLayer: l,
      })
    } else {
      // if this is not the first value being added to the field's chart, add to the arrays
      newTabData['data'][field].push(value)
      newTabData['charts'][field]['data'].push(value)
    }
    return newTabData
  }

  containsLayer(list, layer) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].title === layer.title) {
        return true;
      }
    }
    return false;
  }

}
