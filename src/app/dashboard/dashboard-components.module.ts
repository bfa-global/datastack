import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardGroupComponent } from './components/dasboard-group/dashboard-group.component';
import { SectionHeaderComponent } from './components/section-header/section-header.component';
import { SectionContentComponent } from './components/section-content/section-content.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { CardComponent } from './components/card/card.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { SpeedoComponent } from './components/speedo/speedo.component';
import { GraphComponent } from './components/graph/graph.component';
import { TableComponent } from './components/table/table.component';
import { KpiMetricComponent } from './components/kpi-metric/kpi-metric.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import { VisualizationComponentComponent } from './components/visualization-component/visualization-component.component';
import { SegmentedButtonComponent } from './components/segmented-button/segmented-button.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DropdownElementComponent } from './components/dropdown-element/dropdown-element.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AngularResizedEventModule } from 'angular-resize-event';
import { DataTablesModule } from 'angular-datatables';
import { DragulaModule } from 'ng2-dragula';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PageService } from './services/page.service';
import { DatasourceService } from './services/datasource.service';
import { CalculationsService } from './services/calculations.service';
import { DataCacheService } from './services/data-cache.service';
import { ActionHandlerService } from './services/action-handler.service';
import { DataPaneComponent } from './components/data-pane/data-pane.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardGroupComponent,
    SectionHeaderComponent,
    SectionContentComponent,
    CarouselComponent,
    CardComponent,
    TabsComponent,
    SpeedoComponent,
    GraphComponent,
    TableComponent,
    KpiMetricComponent,
    VisualizationComponent,
    VisualizationComponentComponent,
    SegmentedButtonComponent,
    DatePickerComponent,
    DropdownElementComponent,
    ToolbarComponent,
    DataPaneComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule,
    AngularResizedEventModule,
    DataTablesModule,
    DragulaModule.forRoot(),
    NgZorroAntdModule,
  ],
  providers: [
    PageService,
    DatasourceService,
    CalculationsService,
    DataCacheService,
    ActionHandlerService
  ],
  exports: [
    DashboardComponent,
    DashboardGroupComponent,
    SectionHeaderComponent,
    SectionContentComponent,
    CarouselComponent,
    CardComponent,
    TabsComponent,
    SpeedoComponent,
    GraphComponent,
    TableComponent,
    KpiMetricComponent,
    VisualizationComponent,
    VisualizationComponentComponent,
    SegmentedButtonComponent,
    DatePickerComponent,
    DropdownElementComponent,
    ToolbarComponent,
    DataTablesModule
  ]
})
export class DashboardComponentsModule { }
