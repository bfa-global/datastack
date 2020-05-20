import { VegaChartType } from "./vega-chart-type.model";
import { MapLayer } from "./layer.model";

export class VegaChart {
  id: string
  title: string
  type: VegaChartType
  agg: boolean
  fieldName: string
  data: Object[]
  sourceLayer: MapLayer

  static fromJSON(d: Object): VegaChart {
    let obj = Object.assign(new VegaChart(), d);
    return obj
  }

  getJsonSpec(): Object {
    switch (this.type) {
      case VegaChartType.BarChart: {
        return {
          "$schema": "https://vega.github.io/schema/vega-lite/v3.0.0-rc3.json",
          "data": {
            "values": this.data
          },
          "mark": {
            "type": "bar",
            "color": "#1ab394"
          },
          "encoding": {
            "y": {
              "field": "data",
              "type": "nominal",
              "title": ""
            },
            "x": {
              "aggregate": "count",
              "type": "quantitative",
              "title": "",
              "axis": {
                "grid": false
              }
            },
            "color": {
              "condition": {
                "selection": "sel1"
              },
              "value": "grey"
            }
          },
          "selection": {
            "sel1": {
              "fields": ["data"],
              "on": "click",
              "type": "single"
            }
          }
        }
      }
    }
  }

  getOptions(): Object {
    switch (this.type) {
      case VegaChartType.BarChart: {
        return {
          "actions": {
            "export": false,
            "source": false,
            "complied": false,
            "editor": false
          }
        }
      }
    }
  }

  getMapQuery(val) {
    if (this.sourceLayer.datasource == "carto") {
      if (this.agg) {
        //Aggregated results show up in arrays, so we have to search using LIKE
        return `SELECT row_number() over() as cartodb_id, nigeria_states.the_geom_webmercator as the_geom_webmercator, data, ans_count, total, x.states as states
              FROM
                (SELECT (count(case when ` + this.fieldName + ` like '%` + val +
          `%' then '1' end) / (count(*) * 1.0)) as data, (count(case when ` + this.fieldName + ` like '%` + val + `%' then '1' end)) as ans_count, count(*) as total` /*+ col*/ +
          `, states
                FROM fii_demo_data_condensed
                GROUP BY states) as x, nigeria_states
              WHERE x.states = lower(nigeria_states.name_1)
              `;
      } else {
        return `SELECT row_number() over() as cartodb_id, nigeria_states.the_geom_webmercator as the_geom_webmercator, data, ans_count, total, x.states as states
              FROM
                (SELECT (count(case ` + this.fieldName + ` when '` + val +
          `' then '1' end) / (count(*) * 1.0)) as data, (count(case ` + this.fieldName + ` when '` + val + `' then '1' end)) as ans_count, count(*) as total` /*+ col*/ +
          `, states
                FROM fii_demo_data_condensed
                GROUP BY states) as x, nigeria_states
              WHERE x.states = lower(nigeria_states.name_1)
              `
      }
    } else {
      if (this.agg) {
        //Aggregated results show up in arrays, so we have to search using LIKE
        return `SELECT id, states.geog AS geog, data, ans_count, total, x.states as states \
               FROM \
                (SELECT (count(case when ` + this.fieldName + ` like '%` + val +
          `%' then '1' end) / (count(*) * 1.0)) as data, (count(case when ` + this.fieldName + ` like '%` + val + `%' then '1' end)) as ans_count, count(*) as total` /*+ col*/ +
          `, states \
                FROM nigeria_demo.fii_condensed \
                GROUP BY states) as x, nigeria_demo.states AS states \
              WHERE x.states = lower(states.name_1)\
              `;
      } else {
        return `SELECT id, states.geog AS geog, data, ans_count, total, x.states as states \
               FROM \
                (SELECT (count(case ` + this.fieldName + ` when '` + val +
          `' then '1' end) / (count(*) * 1.0)) as data, (count(case ` + this.fieldName + ` when '` + val + `' then '1' end)) as ans_count, count(*) as total` /*+ col*/ +
          `, states \
                FROM nigeria_demo.fii_condensed \
                GROUP BY states) as x, nigeria_demo.states AS states \
              WHERE x.states = lower(states.name_1)\
              `
      }
    }
  }

}