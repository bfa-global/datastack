import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MapsComponent } from './maps.component';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { DragulaModule } from 'ng2-dragula';
import { SharedModule } from '../shared/shared.module';

import { LayerComponent } from './components/layer/layer.component';
import { MapSideNavComponent } from './components/map-side-nav/map-side-nav.component';
import { ActiveLayersComponent } from './components/active-layers/active-layers.component';
import { AddLayerComponent } from './components/add-layer/add-layer.component';

import { MapSideNavService } from './services/map-side-nav.service';
import { MapLayerService } from './services/map-layer.service';
import { AddCompoundLayerComponent } from './components/add-compound-layer/add-compound-layer.component';
import { MapDrawerComponent } from './components/map-drawer/map-drawer.component';
import { MapDrawerService } from './services/map-drawer.service';
import { MapDrawerTabsComponent } from './components/map-drawer-tabs/map-drawer-tabs.component';
import { MapDrawerTabChartComponent } from './components/map-drawer-tabs/map-drawer-tab-chart/map-drawer-tab-chart.component';
import { LayerDetailComponent } from './components/layer-detail/layer-detail.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { LayerFiltersComponent } from './components/layer-filters/layer-filters.component';
import { PickerFilterComponent } from './components/picker-filter/picker-filter.component';
import { LayerStyleComponent } from './components/layer-style/layer-style.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { DashboardComponentsModule } from '../dashboard/dashboard-components.module';

const routes: Routes = [
  { path: '', component: MapsComponent }
]
@NgModule({
  declarations: [
    MapsComponent,
    LayerComponent,
    MapSideNavComponent,
    ActiveLayersComponent,
    AddLayerComponent,
    AddCompoundLayerComponent,
    MapDrawerComponent,
    MapDrawerTabsComponent,
    MapDrawerTabChartComponent,
    LayerDetailComponent,
    BackButtonComponent,
    LayerFiltersComponent,
    PickerFilterComponent,
    LayerStyleComponent,
  ],
  imports: [
    CommonModule,
    LeafletModule,
    DragulaModule.forRoot(),
    SharedModule,
    ColorPickerModule,
    FormsModule,
    NgZorroAntdModule,
    DashboardComponentsModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    MapSideNavService,
    MapLayerService,
    MapDrawerService,
  ]
})
export class MapsModule { }
