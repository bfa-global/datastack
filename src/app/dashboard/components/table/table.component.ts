import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { VisualizationComponent } from '../visualization/visualization.component';
import { DataCacheService } from '../../services/data-cache.service';
import { RequestOperation } from '../../models/request-operation.model';
import { Response } from '../../models/response.interface';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnDestroy {

  @Input('component') component
  options: DataTables.Settings = {};
  private destroy$ = new Subject();
  callback

  constructor(
    public dataService: DataService,
    public dataCacheService: DataCacheService
  ) { }

  // --- Life Cycle --- 

  ngOnInit() {
    let subject = this.component.dataRefs[0]["dataSubject"]
    //take 2 so can display data from initial subscribtion plus update
    subject.takeUntil(this.destroy$).subscribe((response: Response) => {
      if (response && this.callback) {
        this.callback({
          recordsTotal: response.metadata["total_count"],
          recordsFiltered: response.metadata["total_count"],
          data: response.data
        });
      }
    })
    this.setupTable()
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  // --- Setup & Configuration --- 

  setupTable() {

    const that = this;
    this.configure({
      ...this.component["options"],
      pagingType: 'full_numbers',
      // serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      ajax: (dataTablesParameters: any, callback) => {
        this.callback = callback

        // Get keys for page and count, then map to dataref params
        let request: RequestOperation = this.dataService.createRequestFromDataRef(this.component.dataRefs[0])

        // Update Length
        let pageLengthKey = request.operation.paginationPageLengthMappingKey()
        if (pageLengthKey && pageLengthKey in request.parameters) {
          request.parameters[pageLengthKey] = dataTablesParameters["length"]

          // If API Expects pages, convert start record into start page adding minimum page offset
          let pageNumberKey = request.operation.paginationPageNumberMappingKey()
          if (pageNumberKey && pageNumberKey in request.parameters) {
            // Get minimum page offset if it is defined
            let pageMinimum = 0
            let pageNumberSchema = request.operation.paginationPageNumber()["schema"]
            if ('minValue' in pageNumberSchema) {
              pageMinimum = pageNumberSchema["minValue"]
            }
            request.parameters[pageNumberKey] = (dataTablesParameters["start"] / dataTablesParameters["length"]) + pageMinimum
          }
        }

        this.dataService.executePendingRequest(request)
      }
    });
  }

  configure(options: {}): void {
    this.options = { ...this.options, ...options }
  }
}
