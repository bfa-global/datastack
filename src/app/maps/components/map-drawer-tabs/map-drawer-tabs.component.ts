import { Component, OnInit, Input } from '@angular/core';
import { MapDrawerService } from '../../services/map-drawer.service';
import vegaEmbed from 'vega-embed'
import { MapLayer } from '../../models/layer.model';
import { MapLayerService } from '../../services/map-layer.service';
import { LayerType } from '../../models/layer-type.model';

@Component({
  selector: 'app-map-drawer-tabs',
  templateUrl: './map-drawer-tabs.component.html',
  styleUrls: ['./map-drawer-tabs.component.css']
})
export class MapDrawerTabsComponent implements OnInit {

  @Input()
  tabs: any[]

  index: number = 0

  constructor(
    public mapDrawerService: MapDrawerService,
    public mapLayerService: MapLayerService,
  ) { }

  ngOnInit() { }

  // need to use after view init so that vegaEmbed elements are present
  ngAfterViewInit() {
    this.mapDrawerService.tabsDataArray.subscribe((tabs) => {
      this.index = tabs.length - 1
    })
  }

  objectKeys(dict) {
    return Object.keys(dict)
  }

}
