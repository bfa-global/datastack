import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SidenavService } from '../../services/sidenav.service';
import { MenuService } from '../../../services/menu.service';
import { DatasourceService } from '../../../dashboard/services/datasource.service';

declare let $: any;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {



  constructor(
    public sidenavService: SidenavService,
    public menuService: MenuService,
    public datasourceService: DatasourceService
  ) { }

  ngOnInit() {
    this.menuService.availableMenus.subscribe(menuItems => {
      if (menuItems) {
        setTimeout(() => {
          this.activateMenu()
        }, 2);
      }
    })
  }

  activateMenu() {
    $('#side-menu').metisMenu();
  }

}
