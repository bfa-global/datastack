import { Component, OnInit } from '@angular/core';
import { MapSideNavService } from '../../services/map-side-nav.service';

@Component({
  selector: 'app-map-side-nav',
  templateUrl: './map-side-nav.component.html',
  styleUrls: ['./map-side-nav.component.scss']
})
export class MapSideNavComponent implements OnInit {

  constructor(
    public mapSideNavService: MapSideNavService
  ) { }

  ngOnInit() {
  }

}
