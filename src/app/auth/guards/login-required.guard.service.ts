import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { MenuService } from '../../services/menu.service';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoginRequiredGuardService implements CanActivate, CanLoad {

  constructor(
    public authService: AuthService,
    public router: Router,
    public menuService: MenuService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canAccess(state.url.split('/'))
  }
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return this.canAccess(route.path.split('/'))
  }

  canAccess(route: any[]) {
    return new Promise<boolean>((resolve, reject) => {
      this.menuService.availableMenus.pipe(
        filter(menus => menus !== undefined)
      ).subscribe((availableMenus) => {
        route = route.filter(function (el) {
          return el != "";
        });
        let allowed = false
        if (route.length === 0 || (route[0] === "app" && route.length === 1)) {
          // Home or landing page
          allowed = true
        } else if (this.authService.isAdmin() && route[1] === "settings") {
          allowed = true
        } else {
          //if not landing page, get last path param and see if matching page is allowed 
          let pageName = route.pop()
          let allowedPage = this.menuService.allowedPageWithName(pageName)
          allowed = allowedPage ? true : false
        }
        if (!allowed) {
          this.navigateToSaftey()
        }
        resolve(allowed)
      })
    })
  }
  navigateToSaftey() {
    this.router.navigate(['/app'])
  }
}
