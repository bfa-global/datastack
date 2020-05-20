import { Component, OnInit, Input } from '@angular/core';

import { VisualizationComponent } from '../visualization/visualization.component';

import * as d3 from "d3";
import { DashboardVisualization } from '../../models/dashboard-visualization.model';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';

@Component({
  selector: 'app-kpi-metric',
  templateUrl: './kpi-metric.component.html',
  styleUrls: ['./kpi-metric.component.css']
})
export class KpiMetricComponent implements OnInit {

  defaults = {
    negativeIsBetter: true,
    format: ".1f",
    dataSubject: undefined,
    small: undefined
  }


  @Input('component') component: DashboardVisualizationComponent
  @Input('data') data


  getDataPoint() {
    let value
    if (this.data !== undefined && this.data.length > 0 && this.component.dataRefs[0]) {
      let datapoint = this.data[0]
      value = this.component.dataRefs[0].displayValueForDataPoint(datapoint);
    }
    return value
  }



  constructor() { }

  ngOnInit() {
  }

  format(data) {
    data = Math.abs(data)
    let metric = data
    if (data !== undefined) {
      let format = this.component.options['format']
      if (format === undefined) {
        format = this.defaults['format']
      }
      metric = d3.format(format)(data)

      let suffix = this.component.options['suffix']
      if (suffix === undefined) {
        suffix = this.defaults['suffix']
      }
      if (suffix !== undefined) {
        metric = metric + suffix
      }
    }

    return metric
  }

  indicatorColor(data) {
    let textClass = "text-warning"
    if (data) {

      let negativeIsBetter = this.component.options['negativeIsBetter']
      if (negativeIsBetter === undefined) {
        negativeIsBetter = this.defaults['negativeIsBetter']
      }

      if ((negativeIsBetter === true && data <= 0) || (negativeIsBetter === false && data >= 0)) {
        textClass = "text-primary"
      } else {
        textClass = "text-danger"
      }

    }
    return textClass
  }

  changeSymbol(data) {
    let symbol = ''
    if (data !== undefined) {
      if (data > 0) {
        symbol = 'fa-play fa-rotate-270'
      } else if (data < 0) {
        symbol = 'fa-play fa-rotate-90'
      }
    }
    return symbol
  }

}
