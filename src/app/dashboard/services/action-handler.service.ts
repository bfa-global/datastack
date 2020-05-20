import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { DashboardElementGroup } from '../models/dashboard-element-group.model';
import { DashboardVisualizationComponent } from '../models/dashboard-visualization-component.model';
import * as d3 from "d3";
import { ExportService } from '../../shared/services/export.service';
import { toNumber } from 'ng-zorro-antd';
import { DataReference } from '../models/data-reference.model';

@Injectable({
  providedIn: 'root'
})
export class ActionHandlerService {

  constructor(
    public dataService: DataService,
    public exportService: ExportService,
  ) { }

  handleActions(actions: any[], components) {
    //Group actions by component to ensure the datasource for each component only reloads once
    let actionsByComponents = d3.nest().key((d) => {
      let componentId = d["componentId"]
      return componentId
    }).entries(actions)

    for (let actionGroupForComponent of actionsByComponents) {
      let dataRefsToUpdate = []
      let component = this.findInSubComponentsElementWithID(components, actionGroupForComponent["values"][0]["componentId"])
      if (component) {
        for (let componentAction of actionGroupForComponent["values"]) {
          this.executeActionUpdatesForComponent(componentAction, component)
          // If key updates dataref, indicate so can schedule request after all updates are made 
          if ('key' in componentAction && componentAction.key.includes("dataRefs") && this.isArrayKey(componentAction.key)) {
            let index = this.indexFromArrayKey(componentAction.key)
            dataRefsToUpdate.push(component['dataRefs'][index])
          }
        }
      } else {
        console.warn("Could not locate component '" + actionGroupForComponent.key + "' to perform update action(s) ", actionGroupForComponent.values)
      }
      if (dataRefsToUpdate.length) {
        for (let dataRef of dataRefsToUpdate) {
          //only schedule reloads once all updates for a component are complete
          this.dataService.getDataOrScheduleRequestForDataref(dataRef)
        }
      }
    }

    // Send all scheduled network updates
    this.dataService.executePendingRequestOperations()
  }

  findInSubComponentsElementWithID(subComponents: Array<DashboardElementGroup | DashboardVisualizationComponent>, id: string): DashboardElementGroup | DashboardVisualizationComponent {
    let foundComponent = undefined
    for (let component of subComponents) {
      let componentId = component["id"]
      if (componentId === id) {
        foundComponent = component
        break
      } else if (component["type"] === "group") {
        let comp = this.findInSubComponentsElementWithID(component["components"], id)
        if (comp) {
          foundComponent = comp
          break
        }
      }
    }
    return foundComponent
  }

  executeActionUpdatesForComponent(action, component) {
    if ('key' in action) {
      let keyPath = action["key"].split(".")
      let updatePath = component
      for (let key of keyPath) {
        if (key in updatePath) {
          if (key !== keyPath[keyPath.length - 1]) {
            updatePath = updatePath[key]
          } else {
            updatePath[key] = action.value
          }
        } else if (this.isArrayKey(key)) {
          let baseKey = key.substring(0, key.search(/\[/))
          let index = this.indexFromArrayKey(key)
          updatePath = updatePath[baseKey][index]
        } else {
          updatePath[key] = action.value
          console.warn(key, "from keypath", action["key"], "does not exist in component", component)
          break
        }
      }
    } else if ('type' in action) {
      if (action["type"] === 'export') {
        this.export(component)
      }
    }
  }

  isArrayKey(key): boolean {
    return key.search(/\[/) !== -1 && key.search(/\]/) !== -1
  }

  indexFromArrayKey(key): number {
    return parseInt(key.substring(key.search(/\[/) + 1, key.search(/\]/)))
  }

  export(component) {
    let dataSubject = component["dataSubject"]["dataRef"]
    let data = dataSubject.getValue()
    this.exportService.export(data.data, component.title)
  }
}
