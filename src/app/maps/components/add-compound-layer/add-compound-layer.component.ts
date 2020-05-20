import { Component, OnInit } from '@angular/core';
import { MapSideNavService } from '../../services/map-side-nav.service';
import { MapLayerService } from '../../services/map-layer.service';
import { LayerType } from '../../models/layer-type.model';
import { MapLayer } from '../../models/layer.model';
import { MapDrawerService } from '../../services/map-drawer.service';

@Component({
  selector: 'app-add-compound-layer',
  templateUrl: './add-compound-layer.component.html',
  styleUrls: ['./add-compound-layer.component.css']
})
export class AddCompoundLayerComponent implements OnInit {

  constructor(
    public mapSideNavService: MapSideNavService,
    public mapLayerService: MapLayerService,
    public mapDrawerService: MapDrawerService,
  ) { }

  ngOnInit() {
  }

  displayLayer(layer: MapLayer) {
    this.mapLayerService.displayLayer(layer)
    this.mapSideNavService.addLayer = false
    this.mapSideNavService.addCompoundLayer = false
  }

}
