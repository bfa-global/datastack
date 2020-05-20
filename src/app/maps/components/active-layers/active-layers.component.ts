import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapSideNavService } from '../../services/map-side-nav.service';
import { MapLayerService } from '../../services/map-layer.service';
import { DragulaService } from 'ng2-dragula';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-active-layers',
  templateUrl: './active-layers.component.html',
  styleUrls: ['./active-layers.component.css']
})
export class ActiveLayersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  constructor(
    public mapSideNavService: MapSideNavService,
    public mapLayerService: MapLayerService,
    private dragulaService: DragulaService,
  ) {
    dragulaService.dropModel().takeUntil(this.destroy$).subscribe((value) => {
      this.baseLayersChanged(value);
    })
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.destroy$.next();
  }

  baseLayersChanged(dropEvent) {
    if (dropEvent.name === "activeDataLayers") {
      this.mapLayerService.swapActiveDataLayers(dropEvent.sourceIndex, dropEvent.targetIndex)
    } else if (dropEvent.name === "activeBaseLayers") {
      this.mapLayerService.swapActiveBaseLayers(dropEvent.sourceIndex, dropEvent.targetIndex)
    }
  }


}
