import { LayerType } from "./layer-type.model";
import * as carto from '../../../../node_modules/@carto/carto.js';
import { Filter } from "./filter.model"
import 'leaflet';
import 'leaflet.markercluster';
const L = window['L'] as any;

export class MapLayer {
    id: string
    title: string
    type: LayerType
    filters: Filter[]
    datasource: string
    table: string
    actions: any[]
    compoundTitleKey: string = undefined; // the field from the first query to populate the child layer's title with
    compoundQueryKeys: string[] = undefined; // the fields to extract from the first query's results and populate in the subquery's {s} wildcards
    compoundSubQuery: string = undefined; // the query to run after replacing the {s} wildcards usingt results from the original query
    selectableVisualizationTypeKey: string = undefined; // the field name in the original query's results from which to extract a |||-separated set of visualization types that corresponds to the |||-separated fields to visualize
    selectableVisualizationTypes: string[] = undefined; // the |||-separated set of visualization types that corresponds to the |||-separated fields to visualize
    selectableVisualizationTitleKey: string = undefined; // the field name in the original query's results from which to extract a |||-separated set of visualization titles that corresponds to the |||-separated fields to visualize
    selectableVisualizationTitles: string[] = undefined; // the |||-separated set of visualization titles that corresponds to the |||-separated fields to visualize
    style: any

    _interactivity: string[] = undefined
    get interactivity() {
        return this._interactivity
    }
    set interactivity(interactivity: string[]) {
        this._interactivity = interactivity
        this.updateLayerInteractivity()
    }

    updateLayerInteractivity() {
        if (this._layer && this.interactivity) {
            this._layer.setFeatureClickColumns(this.interactivity)
            this._layer.setFeatureOverColumns(this.interactivity)
        }
    }
    _layer: any = undefined;
    get layer(): any {
        if (!this._layer) {
            this._layer = this.newLayer()
        } else if (this.datasource.toLowerCase() == "carto") {
            this.source = this.sql
            this._styleString = this.layerToStyleString()
        }
        if (this.datasource.toLowerCase() === "carto") {
            this.updateLayerInteractivity()
        }
        return this._layer
    }
    set layer(layer) {
        this._layer = layer
    }

    newLayer() {
        let layer
        if (this.datasource.toLowerCase() === "carto") {
            layer = new carto.layer.Layer(this.source, this._styleString, {
                featureClickColumns: this.interactivity,
                featureOverColumns: this.interactivity
            });
        } else {
            if (this.type === LayerType.DataLayer) {
                layer = L.markerClusterGroup()
            } else {
                layer = L.geoJSON()
            }
            console.log("Created layer", layer)
        }
        return layer
    }

    _source
    get source(): any {
        let sql = this.sql
        if (!this._source && this.datasource.toLowerCase() === "carto") {
            this._source = new carto.source.SQL(sql)
        } else {
            this.source = sql
        }
        return this._source
    }

    set source(sql) {
        this._source.setQuery(sql)
    }

    _sql: string
    get sql(): string {
        let sql = this._sql
        if (this.filters) {
            for (let filter of this.filters) {
                if (filter.selectedFilterValue !== undefined && filter.selectedFilterValue['val'] !== undefined) {
                    sql = sql + this.whereKeyword(sql) + filter.column + " = " + this.formattedValue(filter.selectedFilterValue['val'])
                }
            }
        }
        return sql
    }
    set sql(sql: string) {
        this._sql = sql
    }

    formattedValue(value) {
        if (typeof (value) === 'boolean') {
            return value
        } else if (typeof (value) === 'string') {
            return "\'" + value + "\'"
        }
        return value
    }

    whereKeyword(currentSql) {
        if (currentSql.toLowerCase().includes('where')) {
            return ' and '
        }
        return ' where '

    }

    _styleString
    get styleString() {        
        // Change to a carto style string and set as CartoCSS if using carto
        // Otherwise just use the raw json from the spec as is
        if (this.datasource.toLowerCase() === "carto" && !this._styleString) {
            let styleString = this.layerToStyleString()
            this._styleString = new carto.style.CartoCSS(styleString);
        }

        return this._styleString
    }

    set styleString(style) {
        if (this.datasource.toLowerCase() === "carto") {
            this._styleString.setContent(style)
        } else {
            this._styleString = style
        }
    }

    layerToStyleString(): string {
        let styleString = ""

        for (let key of Object.keys(this.style)) {
            let objValues = this.style[key]
            let objKeys = Object.keys(objValues)
            if (objKeys.length > 0) {
                styleString += "#" + key + "{"
                for (let objKey of objKeys) {
                    styleString += objKey + ":" + objValues[objKey] + ";"
                }
                styleString += "}"
            }
        }

        return styleString
    }

    static fromJSON(d: Object): MapLayer {
        let obj = Object.assign(new MapLayer(), d);
        if (d['filters']) {
            obj.filters = d['filters'].map((d) => Filter.fromJSON(d))
        }
        obj.type = LayerType[d['type'] as string]
        return obj
    }







}