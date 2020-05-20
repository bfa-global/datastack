import { Injectable } from '@angular/core';
import { Datasource } from '../models/datasource.model';
import { BehaviorSubject } from 'rxjs';
import { DataReference } from '../models/data-reference.model';
import 'rxjs/add/operator/takeUntil';
import * as d3 from "d3"

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {

  datasources = new BehaviorSubject<Datasource[]>(undefined);

  constructor() {
    this.loadDatasources()
  }

  loadDatasources(): Promise<any> {
    return new Promise((resolve, reject) => {
      d3.json("./assets/json/datasources.json").then((response) => {
        let datasources: Datasource[] = response.map((d) => Datasource.fromJSON(d))
        this.datasources.next(datasources)
        resolve()
      })
    })
  }

  datasourceContainsReference(dataRef: DataReference): boolean {
    let datasources = this.datasources.getValue()
    let ids = datasources.map(d => d["id"])
    return ids.indexOf(dataRef.dataSourceId) !== -1
  }

  datasourceMatchingReference(dataRef: DataReference): Datasource {
    return this.datasourceForID(dataRef.dataSourceId)
  }
  
  datasourceForID(datasourceId: string): Datasource {
    let matchedDatasource
    for (let datasource of this.datasources.getValue()) {
      if (datasourceId === datasource.id) {
        matchedDatasource = datasource
        break
      }
    }
    return matchedDatasource
  }


}
