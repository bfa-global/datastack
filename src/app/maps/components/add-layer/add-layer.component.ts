import { Component, OnInit } from '@angular/core';
import { MapSideNavService } from '../../services/map-side-nav.service';
import { MapLayerService } from '../../services/map-layer.service';
import { LayerType } from '../../models/layer-type.model';
import { MapLayer } from '../../models/layer.model';

@Component({
  selector: 'app-add-layer',
  templateUrl: './add-layer.component.html',
  styleUrls: ['./add-layer.component.css']
})
export class AddLayerComponent implements OnInit {

  constructor(
    public mapSideNavService: MapSideNavService,
    public mapLayerService: MapLayerService
  ) { }

  ngOnInit() {
  }

  displayLayer(layer: MapLayer) {
    if (layer.type === LayerType.DataLayer) {
      this.mapLayerService.displayDataLayer(layer)
    } else if (layer.type === LayerType.SelectableLayer) {
      this.mapLayerService.prepareCompoundLayers(layer)
      this.mapSideNavService.toggleAddCompoundLayer()
    } else if (layer.type === LayerType.BaseLayer) {
      this.mapLayerService.displayBaseLayer(layer)
    }
    this.mapSideNavService.addLayer = false;
  }

}
