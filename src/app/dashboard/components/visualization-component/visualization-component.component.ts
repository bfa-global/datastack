import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';
import { ExportService } from '../../../shared/services/export.service';
import { AuthService } from '../../../auth/auth.service';
import { Observable, combineLatest, Subject, zip } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Response } from '../../models/response.interface';
import { Error } from '../../../shared/models/error.model';

@Component({
  selector: 'app-visualization-component',
  templateUrl: './visualization-component.component.html',
  styleUrls: ['./visualization-component.component.css']
})
export class VisualizationComponentComponent implements OnInit, OnDestroy {

  @Input() component: DashboardVisualizationComponent
  @Output() actions = new EventEmitter();

  observables
  private destroy$ = new Subject();


  constructor(
    public exportService: ExportService,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    if ("dataRefs" in this.component) {
      this.observables = this.observersForDataRefs().takeUntil(this.destroy$)
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  observersForDataRefs(): Observable<any> {
    let allDataSubs = this.component.dataRefs.map(d => d.dataSubject)
    return combineLatest(...allDataSubs);
  }

  isFinishedLoadingResponses(responses: Response[]): boolean {
    return responses !== undefined && responses.length !== 0 && responses.reduce((a, dataElement) => a === false ? false : dataElement !== undefined, true) // make sure array values returned from zip are not undefind
  }
  hasErrorInResponses(responses: Response[]): boolean {
    return this.firstErrorInResponses(responses) !== undefined // make sure array values returned from zip are not undefind
  }

  firstErrorInResponses(responses: Response[]): Error {
    return responses.reduce((a, e) => a !== undefined ? a : e.error, undefined) as Error // make sure array values returned from zip are not undefind
  }

  hasDataInResponses(responses: Response[]): boolean {
    return responses.reduce((a, e) => a === false ? false : 'data' in e && e.data.length !== 0, true) // make sure array values returned from zip are not undefind
  }
}
