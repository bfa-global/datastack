import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Map } from 'leaflet';
import { MapLayer } from '../../models/layer.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import * as Wkt from 'wicket'
import * as Wkt from '../../../../../node_modules/wicket/wicket-leaflet.js'
import * as L from 'leaflet'

import { icon, Marker } from 'leaflet';
import { MapLayerService } from '../../services/map-layer.service';
import { AuthService } from '../../../auth/auth.service';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'layer',
  template: ''
})
export class LayerComponent implements OnInit, OnDestroy {
  @Input() map: Map;
  @Input() client: any;
  _mapLayer: MapLayer;
  @Input('mapLayer')
  set mapLayer(mapLayer: MapLayer) {
    if (this._mapLayer) {
      this.removeLayer()
    }
    this._mapLayer = mapLayer
    this.addLayer()
  }
  get mapLayer(): MapLayer {
    return this._mapLayer
  }

  static arrify(value) {
    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return [value];
    }

    if (typeof value[Symbol.iterator] === 'function') {
      return [...value];
    }

    return [value];
  };

  static mergeSchemaWithRows(
    schema,
    rows
  ) {
    return this.arrify(rows)
      .map(mergeSchema)
      .map(flattenRows);
    function mergeSchema(row) {
      return row.f!.map((field, index: number) => {
        const schemaField = schema.fields![index];
        let value = field.v;
        if (schemaField.mode === 'REPEATED') {
          value = (value).map(val => {
            return convert(schemaField, val.v);
          });
        } else {
          value = convert(schemaField, value);
        }
        // tslint:disable-next-line no-any
        const fieldObject: any = {};
        fieldObject[schemaField.name!] = value;
        return fieldObject;
      });
    }

    // tslint:disable-next-line no-any
    function convert(schemaField, value: any) {
      if (value === "") {
        return value;
      }

      switch (schemaField.type) {
        case 'BOOLEAN':
        case 'BOOL': {
          value = value.toLowerCase() === 'true';
          break;
        }
        case 'BYTES': {
          // value = Buffer.from(value, 'base64');
          break;
        }
        case 'FLOAT':
        case 'FLOAT64': {
          value = Number(value);
          break;
        }
        case 'INTEGER':
        case 'INT64': {
          value = Number(value);
          break;
        }
        case 'NUMERIC': {
          // value = new Big(value);
          break;
        }
        case 'RECORD': {
          // value = BigQuery.mergeSchemaWithRows_(schemaField, value).pop();
          break;
        }
        case 'DATE': {
          // value = BigQuery.date(value);
          break;
        }
        case 'DATETIME': {
          // value = BigQuery.datetime(value);
          break;
        }
        case 'TIME': {
          // value = BigQuery.time(value);
          break;
        }
        case 'TIMESTAMP': {
          // value = BigQuery.timestamp(new Date(value * 1000));
          break;
        }
        case 'GEOGRAPHY': {
          // value = BigQuery.geography(value);
          break;
        }
        default:
          break;
      }

      return value;
    }

    // tslint:disable-next-line no-any
    function flattenRows(rows: any[]) {
      return rows.reduce((acc, row) => {
        const key = Object.keys(row)[0];
        acc[key] = row[key];
        return acc;
      }, {});
    }
  }


  @Output('actions') actions = new EventEmitter()

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    const iconRetinaUrl = 'assets/images/leaflet/layers-2x.png';
    const iconUrl = 'assets/images/leaflet/marker-icon.png';
    const shadowUrl = 'assets/images/leaflet/marker-shadow.png';
    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    Marker.prototype.options.icon = iconDefault;

    if (!this.mapLayer.layer) return;
  }

  addLayer() {
    if (this.mapLayer.datasource === "carto") {
      if (this.mapLayer.actions !== undefined && this.mapLayer.actions.length) {
        this.mapLayer.layer.on('featureClicked', featureEvent => {
          this.actions.emit({ actions: this.mapLayer.actions, data: featureEvent.data })
        })
      }
      this.client.getLeafletLayer().addTo(this.map);
    } else {
      this.authService.getBigQueryToken().then(access_token=>{
        this.createLayerFromBigQueryApi()
      }).catch(error=>{
        console.debug(error)
      })
    }
  }

  createLayerFromBigQueryApi() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.bigQueryAccessToken
      })
    }

    const body = { "query": this._mapLayer.sql, "useLegacySql": false }
    
    this.http.post(
      environment.bigQueryCredentials.apiUrl + '/projects/' + environment.bigQueryCredentials.projectName + '/queries',
      body,
      httpOptions
    ).subscribe(
      (response) => {
        console.log("Response", response)
        let data = LayerComponent.mergeSchemaWithRows(response["schema"], response["rows"])
        console.log("Parsed Response", data)

        var wicket = new Wkt.Wkt()
        data.forEach(d => {
          // Convert WKT-style GEOG to geojson, set properties
          let wkt = d['geog']
          wicket.read(wkt)
          var data = wicket.toJson()
          if (!('properties' in data)) data['properties'] = {}
          for (let key in d) {
            if (key !== 'geog') {
              data.properties[key] = d[key]
            }
          }
          
          // Create geojson layer with style, popup, and interactions
          // See: https://leafletjs.com/reference-1.3.4.html#geojson-adddata
          // and https://leafletjs.com/examples/choropleth/
          let feature
          var that = this
          if (data.type.toLowerCase() === 'point') {
            feature = L.geoJSON(data, {
              pointToLayer: function(feature, latlng) {
                let marker = L.marker(latlng)

                marker.bindTooltip(function() {
                    return that.getToolTipText(data)
                  },
                  {
                    sticky: true,
                  }
                )

                return marker
              }
            })
          } else {
            feature = L.geoJSON(data)
            
            feature.setStyle(MapLayerService.processStyle(data['properties'], this.mapLayer['style']))

            feature.on({
              mouseover: function(e) {
                var layer = e.target;
            
                layer.setStyle({
                    "fillOpacity": 1
                });
            
                if (!L.Browser.ie && !L.Browser.edge) {
                    layer.bringToFront();
                }
              }, mouseout: function(e) {
                var layer = e.target;
            
                layer.setStyle({
                    "fillOpacity": that.mapLayer['style']['fillOpacity']
                });
              },
              click: function zoomToFeature(e) {
                that.map.fitBounds(e.target.getBounds());
              }
            })
            feature.bindTooltip(function() {
                return that.getToolTipText(data)
              },
              {
                sticky: true,
              }
            )
          }

          // Add to parent geojson
          this.mapLayer.layer.addLayer(feature)
        })

        // Add parent geojson to map
        console.debug("Adding Layer", this.mapLayer.layer)
        this.mapLayer.layer.addTo(this.map)
      }, (errorResponse) => {
        console.warn("Error", errorResponse)
      },
    )

  }

  getToolTipText(data:any) {
    let tt = ""
    for (let key in data['properties']) {
      tt += key + ": " + data['properties'][key] + "<br />";
    }
    return tt
  }

  removeLayer() {
    if (this.mapLayer.datasource === "carto") {
      this.client.removeLayer(this.mapLayer.layer)
    } else {
      this.map.removeLayer(this.mapLayer.layer)
    }
  }

  ngOnChanges() { }

  ngOnDestroy() {
    this.removeLayer()
  }
}
