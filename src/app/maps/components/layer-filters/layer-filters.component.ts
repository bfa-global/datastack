import { Component, OnInit, Input } from '@angular/core';
import { Filter } from '../../models/filter.model';
import { MapLayerService } from '../../services/map-layer.service';

@Component({
  selector: 'app-layer-filters',
  templateUrl: './layer-filters.component.html',
  styleUrls: ['./layer-filters.component.css']
})
export class LayerFiltersComponent implements OnInit {

  @Input() layer

  constructor(
    public mapLayerService: MapLayerService,
  ) { }

  ngOnInit() {
  }

  selectedFilter(filter: Filter) {
    this.mapLayerService.refreshLayer(this.layer)
  }

}
