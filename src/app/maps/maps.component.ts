import { Component, OnInit, ViewChild } from '@angular/core';
import { tileLayer, latLng, latLngBounds, Map } from 'leaflet';
import * as carto from '@carto/carto.js';
import { environment } from '../../environments/environment'
import { MapSideNavService } from './services/map-side-nav.service';
import { MapLayerService } from './services/map-layer.service';
import { MapLayer } from './models/layer.model';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @ViewChild('dashcom') dashboardComponent: DashboardComponent
  map: Map
  cartoClient: any
  options = {
    layers: [
      tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        minZoom: 5,
        maxZoom: 18,
        // attribution: '...'
      })
    ],
    zoom: 5,
    center: latLng(9.0820, 8.6753)
  };
  fitBounds = latLngBounds(latLng(3.972575, 2.539141), latLng(14.038099, 14.895330));

  constructor(
    public mapSideNavService: MapSideNavService,
    public mapLayerService: MapLayerService
  ) {
    //this.cartoClient = new carto.Client(environment.cartoCredentials);
  }

  ngOnInit() {
    let that = this
    this.mapLayerService.activeDataLayers.subscribe(() => {
      that.enforceLayerOrder()
    })
    this.mapLayerService.activeBaseLayers.subscribe(() => {
      that.enforceLayerOrder()
    })

  }

  enforceLayerOrder() {
    let that=this
    this.mapLayerService.allActiveLayers().forEach(function (l) {
      if (l.datasource.toLowerCase() === 'carto') {
        that.cartoClient.removeLayer(l)
      } else {
        that.map.removeLayer(l.layer)
      }
    })

    // add in reverse to maintain consistency with the list in the sidebar
    this.mapLayerService.allActiveLayers().reverse().forEach(function (l) {
      if (l.datasource.toLowerCase() === 'carto') {
        that.cartoClient.addLayer(l)
      } else {
        that.map.addLayer(l.layer)
      }
    })
  }

  onMapReady(map: Map) {
    this.map = map
  }


  // Actions
  handleActions(actions) {
    for (let action of actions['actions']) {
      if (action['componentId'] === 'dashboard') {
        this.dashboard[action['key']] = this.dereferedActionValue(action['value'], actions)
      }
    }
    if (actions['actions'].filter(action => action['componentId'] === 'dashboard').length > 0) {
      //if an action updates the dashborad, reload the dashboard
      this.dashboardComponent.loadData()
    }

  }

  dereferedActionValue(actionValue, actionGroup): any {
    let dereferencedValue = actionValue
    if (actionValue && typeof (actionValue) === 'string' && actionValue.includes('{dataItem}')) {
      dereferencedValue = actionGroup['data']
    }
    return dereferencedValue
  }


  // Dashboard overlay
  dashboard = {
    visible: false,
    placement: 'bottom',
    title: undefined,
    height: '75vh',
    layoutUrl: '',
    dataItem: undefined,
  }
  open(): void {
    this.dashboard.visible = true;
  }

  close(): void {
    this.dashboard.visible = false;
  }

}
