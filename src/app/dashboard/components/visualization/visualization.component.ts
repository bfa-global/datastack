import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardVisualization } from '../../models/dashboard-visualization.model';
import { DataService } from '../../services/data.service';
import { ActionHandlerService } from '../../services/action-handler.service';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  @Input()
  visualization: DashboardVisualization

  constructor(
    public dataService: DataService,
    public actionHandler: ActionHandlerService,
  ) { }

  ngOnInit() { }


}
