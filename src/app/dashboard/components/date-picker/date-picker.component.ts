import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';
import * as moment from 'moment';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  @Output() actions = new EventEmitter();
  @Input('component')
  component: DashboardVisualizationComponent

  dates = [new Date(), new Date()]

  constructor() { }

  ngOnInit() {
    if (this.component && this.component.options) {

      if ("initialStart" in this.component.options) {
        let initialStart = this.component.options["initialStart"]
        this.dates[0] = moment(initialStart).startOf('day').toDate()
      }
      if ("initialEnd" in this.component.options) {
        let initialEnd = this.component.options["initialEnd"]
        this.dates[1] = moment(initialEnd).endOf('date').toDate()
      }
    }
  }

  onChange(event) {
    let startChanged = event === this.dates[0] || event === this.dates
    let endChanged = event === this.dates[1] || event === this.dates
    if (event && ((startChanged && this.dates[0] !== undefined) || (endChanged && this.dates[1] !== undefined))) {
      let matchingActions = this.getActionsForChange(startChanged, endChanged)
      this.actions.emit(matchingActions)
    }
  }

  getActionsForChange(startChanged: boolean, endChanged: boolean): any[] {
    let matching = []
    for (let action of this.component.options["actions"]) {
      if (startChanged && action.value === "{startDate}") {
        //Create a copy of the action so we can track which value gets substituted
        action = { ...action, value: this.dates[0] }
        matching.push(action)
      } else if (endChanged && action.value === "{endDate}") {
        //Create a copy of the action so we can track which value gets substituted
        action = { ...action, value: this.dates[1] }
        matching.push(action)
      }
    }
    return matching
  }



}
