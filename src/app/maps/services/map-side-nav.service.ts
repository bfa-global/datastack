import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapSideNavService {

  layerDetail = undefined
  hideSideNav: boolean = false;
  addLayer: boolean = false;
  addCompoundLayer: boolean = false;

  constructor() { }

  toggleSideNav(): void {
    this.hideSideNav = !this.hideSideNav;
    this.addLayer = false;
    this.addCompoundLayer = false;
  }

  toggleAddLayer(): void {
    this.addLayer = !this.addLayer;
    this.addCompoundLayer = false;
  }

  toggleAddCompoundLayer(): void {
    this.addCompoundLayer = !this.addCompoundLayer;
    this.addLayer = !this.addCompoundLayer;
  }

  unsetDetail() {
    this.layerDetail = undefined
  }

}
