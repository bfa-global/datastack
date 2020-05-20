import { Component, OnInit, Input } from '@angular/core';
import { MapSideNavService } from '../../services/map-side-nav.service';
import { MapLayerService } from '../../services/map-layer.service';

@Component({
  selector: 'app-layer-detail',
  templateUrl: './layer-detail.component.html',
  styleUrls: ['./layer-detail.component.css']
})
export class LayerDetailComponent implements OnInit {

  @Input() layer

  constructor(
    public mapSideNavService: MapSideNavService,
    public mapLayerService: MapLayerService,

  ) { }

  ngOnInit() {
  }

}
