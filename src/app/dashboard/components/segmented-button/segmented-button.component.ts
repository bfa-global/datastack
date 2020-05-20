import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';

@Component({
  selector: 'app-segmented-button',
  templateUrl: './segmented-button.component.html',
  styleUrls: ['./segmented-button.component.css']
})
export class SegmentedButtonComponent implements OnInit {

  selectedIndex = 0
  @Input() component: DashboardVisualizationComponent
  @Output() actions = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  selected(index: number) {
    this.selectedIndex = index
    let actions = this.component.options["segments"][index].actions
    this.actions.emit(actions)
  }

}
