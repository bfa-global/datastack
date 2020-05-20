import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MapLayerService } from '../../services/map-layer.service';
import { Filter } from '../../models/filter.model';

@Component({
  selector: 'app-picker-filter',
  templateUrl: './picker-filter.component.html',
  styleUrls: ['./picker-filter.component.css']
})
export class PickerFilterComponent implements OnInit {

  @Input() filter: Filter
  @Input() datasource: String
  @Output() selectedFilter = new EventEmitter()

  constructor(
    public mapLayerService: MapLayerService
  ) { }

  ngOnInit() {
    this.getOptionsForFilter()
  }

  getOptionsForFilter() {
    if (this.filter.optionsSql) {
      if (this.datasource === "carto") {
        this.mapLayerService.queryCartoAPI(this.filter.optionsSql, (filter) => this.filter.filterSubject.next(filter), (response) => {
          return [{ title: 'No Filter', val: undefined }, ...response['body']['rows']]
        })
      } else {
        this.mapLayerService.queryBigQueryAPI(this.filter.optionsSql, (filter) => this.filter.filterSubject.next(filter), (response) => {
          return [{ title: 'No Filter', val: undefined }, ...response['body']['rows']]
        })
      }
    }
  }

  selectedValue(value) {
    this.filter.selectedFilterValue = value
    this.selectedFilter.emit(this.filter)
  }

}
