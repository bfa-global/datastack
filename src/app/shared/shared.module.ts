import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpreadComponent } from './components/spread/spread.component';
import { DropdownDirective } from './directives/dropdown.directive';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { ExportService } from './services/export.service';
import { BigqueryParserService } from './services/bigquery-parser.service';
import { EndroadComponent } from './components/endroad/endroad.component';
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [
    SpreadComponent,
    DropdownDirective,
    DropdownComponent,
    EndroadComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    EndroadComponent,
    SpreadComponent,
    DropdownDirective,
    DropdownComponent
  ],
  providers: [
    ExportService,
    BigqueryParserService
  ]
})
export class SharedModule { }
