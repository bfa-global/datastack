import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';

@Component({
  selector: 'app-dashboard-group',
  templateUrl: './dashboard-group.component.html',
  styleUrls: ['./dashboard-group.component.css']
})
export class DashboardGroupComponent implements OnInit {

  @Input() components: DashboardVisualizationComponent[]
  @Output() actions = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
