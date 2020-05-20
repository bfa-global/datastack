import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '../auth/auth.model';

import * as d3 from "d3";
import { MenuItem } from '../shared/models/menu-item.model';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MenuService {


  allMenus = new BehaviorSubject<any[]>(undefined);
  availableMenus = new BehaviorSubject<any[]>(undefined);


  constructor(
    public router: Router,
    public authService: AuthService,
  ) {
    this.allMenus.pipe(
      filter(menus => menus !== undefined)
    ).subscribe(allMenus => {
      // console.log("Subscribibg to all menus", allMenus)
      authService.authentication.subscribe((auth: Auth) => {
        // console.log("Auth Loaded", auth, allMenus)
        let availableMenus = this.menusAvailbleBasedOnAuth(allMenus, auth)
        // console.log("Avaialble Menus", availableMenus)
        this.availableMenus.next(availableMenus)
      })
    })
    this.loadMenus()
  }

  menusAvailbleBasedOnAuth(allMenus: any[], auth: Auth) {
    let availableMenus = []
    for (let menu of allMenus) {
      if (this.menuAvailbleBasedOnAuth(menu, auth)) {
        availableMenus.push(menu)
      }
    }
    return availableMenus
  }

  menuAvailbleBasedOnAuth(menu: object, auth: Auth): boolean {
    let isAvailable: boolean = false

    let authorizedPersonas: string[]
    if ('authorizedPersonas' in menu) {
      authorizedPersonas = menu['authorizedPersonas']
    }
    if (authorizedPersonas && authorizedPersonas.length !== 0) {
      if (auth && auth.user) {
        if (auth.user.isAuthenticatedForGroup(authorizedPersonas)) {
          isAvailable = true;
        }
      }
    } else {
      isAvailable = true;
    }
    // console.log("Authed Personas", menu, isAvailable, authorizedPersonas, auth)

    return isAvailable
  }

  loadMenus(): Promise<any> {
    return d3.json("./assets/json/menu.json").then((response) => {
      let menuItems: MenuItem[] = response.map((d) => MenuItem.fromJSON(d))
      // console.log("Menu Items", menuItems)
      this.allMenus.next(menuItems)
    })

  }

  currentMenu() {
    return this.allowedPageWithName(this.pageName())
  }

  allowedPageWithName(name: string): Object[] {
    let page = undefined
    if (this.availableMenus.getValue()) {
      page = this.getPageForNameArray(name, this.availableMenus.getValue())
    }
    return page
  }


  getPageForNameArray(name: string, array: Object[]) {
    let page

    for (let obj of array) {
      if (!page) {
        if ("href" in obj && obj["href"] === name) {
          page = obj
        } else if ("children" in obj) {
          page = this.getPageForNameArray(name, obj["children"])
        }
      }
    }
    return page
  }

  pageName() {
    let name = ''
    let routeSplit = this.router.url.split('/').filter(function (el) {
      return el != "";
    })
    if (routeSplit.length > 1) {
      name = routeSplit.pop()
    }
    return name
  }
}
