import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardVisualizationComponent } from '../../models/dashboard-visualization-component.model';

@Component({
  selector: 'app-dropdown-element',
  templateUrl: './dropdown-element.component.html',
  styleUrls: ['./dropdown-element.component.css']
})
export class DropdownElementComponent implements OnInit {

  @Input('component') component: DashboardVisualizationComponent
  @Output() actions = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  options(): object {
    return this.component.options as any
  }

  index(): number {
    let index = 0
    if ('initialSelectionIndex' in this.options()) {
      index = this.options()['initialSelectionIndex']
    }
    return index
  }

  selections(): string[] {
    return this.options()["selections"]
  }

  selectionTitles() {
    return this.selections().map(el => el["title"])
  }

  selectedIndex(index) {
    let actions = this.selections()[index]['actions']
    this.actions.emit(actions)
  }
}
