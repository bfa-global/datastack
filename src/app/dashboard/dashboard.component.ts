import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, BehaviorSubject, config } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MenuService } from '../services/menu.service';
import { DataService } from './services/data.service';
import { DataReference } from './models/data-reference.model';
import { DragulaService } from 'ng2-dragula';
import { PageService } from './services/page.service';
import { DatasourceService } from './services/datasource.service';
import { Response } from './models/response.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  @Input() config?

  _layoutUrl: string
  @Input()
  set layoutUrl(url: string) {
    this._layoutUrl = url
    if (this._layoutUrl) {
      this.pageService.loadPageWithURL(this._layoutUrl)
    }
  }
  get layoutUrl(): string {
    return this._layoutUrl
  }

  _page: object[] = undefined;
  get page(): object[] {
    return this._page;
  }
  set page(newPage: object[]) {
    this._page = newPage;
    this.triggerPageDataLoading()
  }

  // Lifecycle Events 

  constructor(
    public router: Router,
    public menuService: MenuService,
    public dataService: DataService,
    public datasourceService: DatasourceService,
    public pageService: PageService,
    private dragulaService: DragulaService,

  ) {
    this.setDragulaMovementRules()
    this.subscribeToPageLoaded()
    this.subscribeToPageChanges()
  }

  // --- Life Cycle --- 

  ngOnInit() { }

  ngOnDestroy() {
    this.destroy$.next();
  }

  // --- Actions --- 

  setDragulaMovementRules() {
    //Don't move when dragging children layouts
    if (this.dragulaService.find('sections') === undefined) {
      this.dragulaService.createGroup("sections", {
        moves: function (el, container, target) {
          return target.classList.contains('handle');
        }
      })
    }
  }

  // Page Changes

  subscribeToPageChanges() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).takeUntil(this.destroy$).subscribe((event: NavigationEnd) => {
      this.triggerPageUpdate()
    });
  }

  subscribeToPageLoaded() {
    let that = this
    this.pageService.pages.pipe(
      filter(pages => pages !== undefined && this.layoutUrl in pages)
    ).takeUntil(this.destroy$).subscribe((pages) => {
      this.page = pages[this.layoutUrl]
    });
  }

  triggerPageUpdate() {
    this.menuService.availableMenus.pipe(
      filter(menus => menus !== undefined)
    ).takeUntil(this.destroy$).subscribe(() => {
      let menu = this.menuService.currentMenu()
      if (menu && "layout_url" in menu) {
        this.layoutUrl = menu['layout_url']
      } else {
        console.warn(menu['title'], "doesn't have a layout_url defined.")
      }
    })
  }

  triggerPageDataLoading() {
    this.datasourceService.datasources.pipe(
      filter(datasources => datasources !== undefined)
    ).takeUntil(this.destroy$).subscribe(datasources => {
      this.loadData()
    })
  }

  loadData() {
    if (this.page) {
      this.promiseDataRefsInArray(this.page)
      this.dataService.executePendingRequestOperations()
    }
  }

  // Setup linkage between wigets and datasources
  promiseDataRefsInArray(array: Object[]) {
    for (let object of array) {
      if (object instanceof Object) {
        this.promiseDataRefsInObject(object)
      }
    }
  }

  promiseDataRefsInObject(object: Object) {
    Object.keys(object).forEach(key => {
      if ('dataRefs' === key) {
        for (let dataRef of object[key] as Array<DataReference>) {
          if (dataRef.dataSourceId === 'dashboard' && dataRef.operationId === 'config') {
            //return data from passed in config vale to display on dashboard
            let value = this.config[dataRef.displayValue]
            let response: Response = { data: [value], metadata: undefined, error: undefined }
            dataRef.dataSubject.next(response)
          } else {
            dataRef.dashboardScope = this.config
            this.dataService.getDataOrScheduleRequestForDataref(dataRef)
          }
        }
      } else if (object[key] instanceof Array) {
        this.promiseDataRefsInArray(object[key])
      } else if (object[key] instanceof Object) {
        this.promiseDataRefsInObject(object[key])
      }
    })
  }

  //used in template
  dereference(ref) {
    if (ref.includes("%summary-daily.loaded-time%")) {
      let loadedTime = this.dataService.timeLastLoaded ? this.dataService.timeLastLoaded.toLocaleString() : "loading..."
      ref = ref.replace("%summary-daily.loaded-time%", loadedTime)
    }
    return ref
  }

}
