import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-data-pane',
  templateUrl: './data-pane.component.html',
  styleUrls: ['./data-pane.component.css']
})
export class DataPaneComponent implements OnInit, OnDestroy {

  @Input() component
  @Input() observables: any
  data
  private destroy$ = new Subject();

  constructor() { }


  ngOnInit() {
    this.observables.pipe(
      filter(response => response !== undefined)
    ).takeUntil(this.destroy$).subscribe((response) => {
      this.data = response[0].data[0]
    })

  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  dereference(value) {
    if (this.data && value && value.length) {
      value = this.data[value]
    }
    return value
  }

}
