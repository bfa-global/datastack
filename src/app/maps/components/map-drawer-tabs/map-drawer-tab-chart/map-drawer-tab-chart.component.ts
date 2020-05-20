import { Component, OnInit, Input } from '@angular/core';
import vegaEmbed from 'vega-embed'
import { MapLayerService } from '../../../services/map-layer.service';
import { LayerType } from '../../../models/layer-type.model';
import { MapLayer } from '../../../models/layer.model';

@Component({
  selector: 'app-map-drawer-tab-chart',
  templateUrl: './map-drawer-tab-chart.component.html',
  styleUrls: ['./map-drawer-tab-chart.component.css']
})
export class MapDrawerTabChartComponent implements OnInit {

  @Input()
  title: string

  @Input()
  field: any

  @Input()
  tab: any

  constructor(
    public mapLayerService: MapLayerService,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.embedCharts()
  }

  embedCharts() {
    let that = this
    vegaEmbed("#vega-vis-" + that.field, that.tab['charts'][that.field].getJsonSpec(), that.tab['charts'][that.field].getOptions()).then(function (result) {
      result.view.addSignalListener("sel1", function (name, val) {
        let filterVal = val[Object.keys(val)[0]][0]
        let newLayer = MapLayer.fromJSON({
          id: that.field + "-" + filterVal,
          title: that.field + "-" + filterVal,
          datasource: 'BigQuery', // TODO: pull from sourceLayer
          sql: that.tab['charts'][that.field].getMapQuery(filterVal),
          type: LayerType[LayerType.BaseLayer],
          style: that.tab['charts'][that.field].sourceLayer.style
        })
        that.mapLayerService.displayBaseLayer(newLayer)
      });
    });
  }

  objectKeys(dict) {
    return Object.keys(dict)
  }

}
