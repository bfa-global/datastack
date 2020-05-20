import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event';

import * as d3 from "d3";
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';


@Component({
  selector: 'app-speedo',
  templateUrl: './speedo.component.html',
  styleUrls: ['./speedo.component.css']
})
export class SpeedoComponent implements OnInit {

  config = {
    width: 200,
    height: 150,
    maxWidth: 200,
    clipWidth: 200,
    clipHeight: 120,
    ringInset: 20,
    ringWidth: 20,

    pointerWidth: 10,
    pointerTailLength: 2,
    pointerHeadLengthPercent: 0.8,

    minValue: 0,
    maxValue: 10,

    minAngle: -90,
    maxAngle: 90,

    transitionMs: 4000,

    majorTicks: 5,
    labelFormat: 'd',
    labelInset: 10,
    labelPostFormat: '',

    arcColors: ["#E63B52", "#F59B47", "#87d6c6", "#51BDA2", "#38A086"],
  };

  range
  r
  scale
  ticks
  tickData
  arc
  pointerAngle = this.config.minAngle
  value
  shouldUpdate = false
  shouldAnimate = false;


  _component: DashboardVisualizationComponent
  @Input('component')
  get component(): DashboardVisualizationComponent {
    return this._component
  }
  set component(component: DashboardVisualizationComponent) {
    this._component = component
    if ("options" in component) {
      this.configure(component['options'])
    }
    if ("dataRefs" in component) {
      if (this.data) {
        this.unpackData()
      }
    }
  }

  _data
  @Input('data')
  get data(): any[] {
    return this._data
  }
  set data(data: any[]) {
    this._data = data
    this.unpackData()
  }

  unpackData() {
    if (this.data !== undefined && this.data.length > 0 && this.component.dataRefs[0]) {
      let datapoint = this.data[0]
      this.value = this._component.dataRefs[0].displayValueForDataPoint(datapoint);
      this.shouldUpdate = true
      this.shouldAnimate = true;
      this.update(this.value, undefined)
    }
  }

  constructor() {
    this.configure(this.config)
  }

  ngOnInit() {
  }

  onResized(event: ResizedEvent) {
    let newWidth = Math.min(event.newWidth, this.config.maxWidth)
    this.config.height = newWidth * .6;
    this.config.width = newWidth;
    this.configure(this.config)
  }

  update(newValue, newConfiguration) {
    if (newConfiguration !== undefined) {
      this.configure(newConfiguration);
    }
    var ratio = this.scale(newValue);
    this.pointerAngle = Math.min(this.config.minAngle + (ratio * this.range), this.config.maxAngle);
  }

  configure(configuration) {

    let that = this
    for (let prop in configuration) {
      this.config[prop] = configuration[prop];
    }

    this.range = this.config.maxAngle - this.config.minAngle;
    this.r = this.config.width / 2;

    // a linear scale that maps domain values to a percent from 0..1
    this.scale = d3.scaleLinear()
      .range([0, 1])
      .domain([this.config.minValue, this.config.maxValue]);

    this.config.ringWidth = this.config.width * .1

    this.ticks = this.scale.ticks(this.config.majorTicks);
    this.tickData = d3.range(this.config.majorTicks).map(function () { return 1 / that.config.majorTicks; });
    this.arc = d3.arc()
      .innerRadius(this.r - this.config.ringWidth - this.config.ringInset)
      .outerRadius(this.r - this.config.ringInset)
      .startAngle(function (d, i) {
        var ratio = d * i;
        return this.deg2rad(this.config.minAngle + (ratio * this.range));
      })
      .endAngle(function (d, i) {
        var ratio = d * (i + 1);
        return this.deg2rad(this.config.minAngle + (ratio * this.range));
      });
  }

  deg2rad(deg) {
    return deg * Math.PI / 180;
  }

  text(d) {
    let text = this.config.labelFormat ? d3.format(this.config.labelFormat)(d) : d
    return text + this.config.labelPostFormat;
  }

  textTransform(d, r) {
    let angle = this.config.minAngle + (this.scale(d) * this.range);
    return this.rotate(angle) + this.translate(0, + (this.config.labelInset - r))
  };

  translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }

  rotate(angle) {
    return 'rotate(' + angle + ')';
  }

  pointerLine() {
    let lineData = [[this.config.pointerWidth / 2, 0],
    [0, -Math.round(this.r * this.config.pointerHeadLengthPercent)],
    [-(this.config.pointerWidth / 2), 0],
    [0, this.config.pointerTailLength],
    [this.config.pointerWidth / 2, 0]];
    let pointerLine = d3.line().curve(d3.curveLinear)
    return pointerLine(lineData)
  }


}
