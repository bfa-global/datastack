import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapLayer } from '../models/layer.model';
import { LayerType } from '../models/layer-type.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as d3 from "d3";
import { ExportService } from '../../shared/services/export.service';
import { BigqueryParserService } from '../../shared/services/bigquery-parser.service';
import { AuthService } from '../../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MapLayerService {

  loadingExportData = false
  allDataLayers = new BehaviorSubject<MapLayer[]>(undefined)
  allBaseLayers = new BehaviorSubject<MapLayer[]>(undefined)
  allSelectableLayers = new BehaviorSubject<MapLayer[]>(undefined)
  compoundLayers = new BehaviorSubject<MapLayer[]>([])
  activeDataLayers = new BehaviorSubject<MapLayer[]>([])
  activeBaseLayers = new BehaviorSubject<MapLayer[]>([])
  activeSelectableLayers = new BehaviorSubject<MapLayer[]>([])

  constructor(
    public http: HttpClient,
    public exportService: ExportService,
    public bigqueryParserService: BigqueryParserService,
    public authService: AuthService
  ) {
    this.loadLayers()
  }

  loadLayers() {
    return d3.json('assets/json/map_layers.json').then((response) => {
      let layers = response.map(d => {
        let layer = MapLayer.fromJSON(d)

        if ('datasource' in layer && layer.datasource.toLowerCase() === 'bigquery') {
          console.log("Loading BigQuery layer from map json specification:", layer)
        } else {
          //Fall back on Carto implementation
          //TODO Find a better way to dereference all the usernames in the sql
          layer.datasource = "carto"
          layer.sql = this.dereferenceSQL(layer.sql)
          if (layer.filters) {
            layer.filters = layer.filters.map(filter => {
              filter.optionsSql = this.dereferenceSQL(filter.optionsSql)
              return filter
            })
          }

          if (layer.interactivity === undefined && layer["type"] === LayerType.DataLayer) {
            this.addInteractivity(layer)
          }
        }
        return layer
      })
      this.setLayers(layers)
    })
  }

  dereferenceSQL(sql) {
    if (sql.includes("{username}")) {
      let username = environment.cartoCredentials.username
      sql = sql.replace(/{username}/g, username)//regex with 'g' replaces all, not just first
    }
    return sql
  }

  addInteractivity(layer: MapLayer) {
    if (layer.datasource === "carto") {
      this.queryCartoAPI(layer.sql, (rows) => {
        layer.interactivity = rows
      }, response => {
        return Object.keys(response.body.fields)
      })
    } else {
      this.queryBigQueryAPI(layer.sql, (rows) => {
        layer.interactivity = rows
      }, response => {
        return Object.keys(response.body.fields)
      })
    }
  }

  exportDataForLayer(layer) {
    if (layer.datasource === "carto") {
      this.loadingExportData = true
      this.queryCartoAPI(layer.sql, (rows) => {
        this.loadingExportData = false
        this.exportService.export(rows, layer.title)
      }, response => {
        return response.body.rows
      })
    } else {
      this.loadingExportData = true
      this.queryBigQueryAPI(layer.sql, (rows) => {
        this.loadingExportData = false
        this.exportService.export(rows, layer.title)
      }, response => {
        response.data = this.bigqueryParserService.mergeSchemaWithRows(response["schema"], response["rows"])
        return response.data
      })
    }

  }


  setLayers(layers: MapLayer[]) {
    let dataLayers = []
    let selectableLayers = []
    let baseLayers = []

    layers.forEach(layer => {

      switch (layer.type) {

        case LayerType.DataLayer:
          dataLayers.push(layer)
          break;

        case LayerType.SelectableLayer:
          selectableLayers.push(layer)
          break;

        case LayerType.BaseLayer:
          baseLayers.push(layer)
          break;

        default:
          console.warn("Invalid layer type", layer.type)
          break;
      }
    })
    this.allDataLayers.next(dataLayers)
    this.allSelectableLayers.next(selectableLayers)
    this.allBaseLayers.next(baseLayers)
  }

  prepareCompoundLayers(layer: MapLayer) {
    if (layer.datasource === "carto") {
      this.queryCartoAPI(layer.sql, (layers) => this.compoundLayers.next(layers), (response) => {
        let compoundLayers = []
        response['body']['rows'].forEach(r => {
          let title = r[layer.compoundTitleKey]
          if (title) {
            let subQuery = layer.compoundSubQuery
            layer.compoundQueryKeys.forEach((o, i) => {
              subQuery = subQuery.replace("{" + i + "}", r[o])
            })

            let newLayer = MapLayer.fromJSON({
              id: layer.id + "-" + this.slugify(title),
              title: title,
              sql: subQuery,
              type: LayerType[layer.type],
              isCompound: false,
              style: layer.style
            })
            if (newLayer.type === LayerType.SelectableLayer) {
              newLayer.selectableVisualizationTypes = r[layer.selectableVisualizationTypeKey].split('|||')
              newLayer.selectableVisualizationTitles = r[layer.selectableVisualizationTitleKey].split('|||')
            }

            compoundLayers.unshift(newLayer)
          }
        });
        return compoundLayers
      })
    } else {
      this.authService.getBigQueryToken().then(access_token=>{
        this.queryBigQueryAPI(layer.sql, (layers) => this.compoundLayers.next(layers), (response) => {
          response.data = this.bigqueryParserService.mergeSchemaWithRows(response["schema"], response["rows"])
          
          let compoundLayers = []
          response.data.forEach(r => {
            let title = r[layer.compoundTitleKey]
            if (title) {
              let subQuery = layer.compoundSubQuery
              layer.compoundQueryKeys.forEach((o, i) => {
                subQuery = subQuery.replace("{" + i + "}", r[o])
              })

              let newLayer = MapLayer.fromJSON({
                id: layer.id + "-" + this.slugify(title),
                title: title,
                sql: subQuery,
                type: LayerType[layer.type],
                isCompound: false,
                style: layer.style
              })
              if (newLayer.type === LayerType.SelectableLayer) {
                newLayer.selectableVisualizationTypes = r[layer.selectableVisualizationTypeKey] ? r[layer.selectableVisualizationTypeKey].split('|||') : []
                newLayer.selectableVisualizationTitles = r[layer.selectableVisualizationTitleKey] ? r[layer.selectableVisualizationTitleKey].split('|||') : []
              }

              compoundLayers.unshift(newLayer)
            }
          });
          return compoundLayers
        })
      }).catch(error=>{
        console.debug(error)
      })
    }
  }

  queryCartoAPI(query, callback, parser, ) {
    this.http.get(
      environment.cartoCredentials.apiUrl + "/sql?api_key=" + environment.cartoCredentials.apiKey + "&q=" + query,
      { observe: 'response' },
    ).subscribe(
      (response) => {
        if (response['status'] === 200) {
          let compoundLayers = parser(response)
          callback(compoundLayers)
        } else {
          console.warn("Error parsing query", query)
        }
      }, (errorResponse) => {
        console.warn("Error", errorResponse)
      },
    )
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
          let compoundLayers = parser(response)
          callback(compoundLayers)
        } else {
          console.warn("Error parsing query", query)
        }
      }, (errorResponse) => {
        console.warn("Error", errorResponse)
      },
    )
  }

  displayLayer(layer: MapLayer) {
    let subject
    if (subject = this.subjectForLayer(layer)) {
      this.displayLayerForSubject(layer, subject)
    }
  }

  displayLayerForSubject(layer: MapLayer, subject) {
    let layers = subject.getValue()
    let found = layers.filter(d => d.id === layer.id)
    if (found.length === 0) {
      layers.push(layer)
    } else {
      let index = layers.indexOf(found)
      layers[index] = layer
    }
    subject.next(layers)
  }

  subjectForLayer(layer: MapLayer) {
    return this.subjectForType(layer.type)
  }

  subjectForType(type: LayerType) {
    let subject = undefined
    switch (type) {
      case LayerType.DataLayer:
        subject = this.activeDataLayers
        break;
      case LayerType.SelectableLayer:
        subject = this.activeSelectableLayers
        break;
      case LayerType.BaseLayer:
        subject = this.activeBaseLayers
        break;

      default:
        console.warn("Found NO Layer")
        break;
    }
    return subject
  }

  displayDataLayer(layer: MapLayer) {
    let allActiveDataLayers = this.activeDataLayers.getValue()
    let found = allActiveDataLayers.filter(d => d.id === layer.id)
    if (found.length === 0 && layer.type === LayerType.DataLayer) {
      allActiveDataLayers.unshift(layer)
      this.activeDataLayers.next(allActiveDataLayers)
    }
  }

  displayBaseLayer(layer: MapLayer) {
    let allActiveBaseLayers = this.activeBaseLayers.getValue()
    let found = allActiveBaseLayers.filter(d => d.id === layer.id)
    if (found.length === 0 && layer.type === LayerType.BaseLayer) {
      allActiveBaseLayers.unshift(layer)
      this.activeBaseLayers.next(allActiveBaseLayers)
    }
  }

  displaySelectableLayer(layer: MapLayer) {
    let allActiveSelectableLayers = this.activeSelectableLayers.getValue()
    let found = allActiveSelectableLayers.filter(d => d.id === layer.id)
    if (found.length === 0) {
      allActiveSelectableLayers.unshift(layer)
      this.activeSelectableLayers.next(allActiveSelectableLayers)
    }
  }

  inactiveDataLayers(): MapLayer[] {
    return this.allDataLayers.getValue().filter(item => (this.activeDataLayers.getValue().indexOf(item) === -1))
  }

  inactiveBaseLayers(): MapLayer[] {
    return this.allBaseLayers.getValue().filter(item => (this.activeBaseLayers.getValue().indexOf(item) === -1))
  }

  inactiveSelectableLayers(): MapLayer[] {
    return this.allSelectableLayers.getValue().filter(item => (this.activeSelectableLayers.getValue().indexOf(item) === -1))
  }

  inactiveCompoundLayers(): MapLayer[] {
    let cl = this.compoundLayers.getValue()
    cl.forEach((i) => {
      this.activeDataLayers.getValue().forEach((j) => {
        if (i['id'] === j['id']) {
          cl.splice(cl.indexOf(i), 1)
        }
      })
      this.activeSelectableLayers.getValue().forEach((j) => {
        if (i['id'] === j['id']) {
          cl.splice(cl.indexOf(i), 1)
        }
      })
      this.activeBaseLayers.getValue().forEach((j) => {
        if (i['id'] === j['id']) {
          cl.splice(cl.indexOf(i), 1)
        }
      })
    })
    return cl
  }

  deactivateLayer(layer: MapLayer) {
    let subject
    if (subject = this.findSubjectForLayer(layer)) {
      this.deactivateFromSubject(layer, subject)
    }
  }

  deactivateFromSubject(layer: MapLayer, layers: BehaviorSubject<MapLayer[]>) {
    console.debug(layer, layers)
    let allActiveRawDataLayers = layers.getValue().reduce((acc, item) => {
      if (item.id !== layer.id) {
        acc.push(item)
      }
      return acc
    }, [])
    layers.next(allActiveRawDataLayers)
  }


  findSubjectForLayer(layer: MapLayer): BehaviorSubject<MapLayer[]> {
    if (this.subjectContainsLayer(this.activeDataLayers, layer)) {
      return this.activeDataLayers
    }
    if (this.subjectContainsLayer(this.activeBaseLayers, layer)) {
      return this.activeBaseLayers
    }
    if (this.subjectContainsLayer(this.activeSelectableLayers, layer)) {
      return this.activeSelectableLayers
    }
    return undefined
  }

  subjectContainsLayer(subject: BehaviorSubject<MapLayer[]>, layer: MapLayer): boolean {
    return subject.getValue().indexOf(layer) !== -1
  }

  refreshLayer(layer: MapLayer) {
    this.deactivateLayer(layer)
    layer._layer = layer.newLayer()
    this.displayLayer(layer)
  }

  allActiveLayers(): MapLayer[] {
    return this.activeDataLayers.getValue().concat(this.activeBaseLayers.getValue())
  }

  swapActiveDataLayers(fromIndex: number, toIndex: number) {
    this.swap(this.activeDataLayers, fromIndex, toIndex)
  }

  swapActiveBaseLayers(fromIndex: number, toIndex: number) {
    this.swap(this.activeBaseLayers, fromIndex, toIndex)
  }

  swap(subject: BehaviorSubject<MapLayer[]>, from, to) {
    let arr = subject.getValue()
    arr.splice(from, 1, arr.splice(to, 1, arr[from])[0]);
    subject.next(arr)
  }

  slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  // Add a ramp function to the typical mapbox simplestyle geojson spec:
  // https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
  static processStyle(data, styleTop) {
    
    // Make a deep copy of the style array
    let style = Object.assign({}, styleTop);

    // Process ramp feature for fillColor
    if (style && 'fillColor' in style && style['fillColor'].startsWith('ramp')) {

      let styleArr = style['fillColor'].substring(5,style['fillColor'].length-1).split(',')
      let dKey = styleArr.shift()
      let d = data[dKey]

      if (styleArr.length > 0) {
        for (let i=1; i<=styleArr.length; i++) {
          if (d > (styleArr.length-i)/styleArr.length) {
            style['fillColor'] = styleArr[styleArr.length-i]
            break
          }
        }
      } else if ('palette' in style) {
        // Colors from: https://colorbrewer2.org/#type=sequential&scheme=PuBuGn&n=9
        let palette = style['palette']
        if (palette === 'warm') {
          style['fillColor'] = d > 0.8 ? '#ecda9a' : 
                d > 0.6 ? '#f1b973' : 
                d > 0.4 ? '#f7945d' :
                d > 0.2 ? '#f86f56' : 
                '#ee4d5a'
        } else {
          style['fillColor'] = d > 0.9 ? '#fff7fb' :
                d > 0.8 ? '#ece2f0' :
                d > 0.7 ? '#d0d1e6' :
                d > 0.6 ? '#a6bddb' :
                d > 0.7 ? '#67a9cf' :
                d > 0.5 ? '#3690c0' :
                d > 0.4 ? '#02818a' :
                d > 0.3 ? '#016c59' :
                d > 0.2 ? '#014636' :
                '#003525'
        }
      }
    }

    return style
  }

}
