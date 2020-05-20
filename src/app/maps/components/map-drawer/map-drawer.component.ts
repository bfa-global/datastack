import { Component, OnInit } from '@angular/core';
import { MapDrawerService } from '../../services/map-drawer.service';
import { MapLayerService } from '../../services/map-layer.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map-drawer',
  templateUrl: './map-drawer.component.html',
  styleUrls: ['./map-drawer.component.scss']
})
export class MapDrawerComponent implements OnInit {

  constructor(
    public mapDrawerService: MapDrawerService,
    public mapLayerService: MapLayerService,
    public http: HttpClient,
  ) { }

  ngOnInit() {
  }

  objectKeys(dict) {
    return Object.keys(dict)
  }

}
