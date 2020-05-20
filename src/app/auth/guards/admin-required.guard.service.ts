import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { MenuService } from '../../services/menu.service';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AdminRequiredGuardService implements CanActivate, CanLoad {

  constructor(
    public authService: AuthService,
    public router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let canAccess = this.canAccess(state.url.split('/'))
    return canAccess
  }
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    //TODO: Validate if token is valid and if user has access
    return true
  }

  canAccess(route: any[]) {
    return new Promise<boolean>((resolve, reject) => {
      this.authService.authentication.pipe(
        filter(authentication => authentication !== undefined)
      ).subscribe((auth) => {

        let allowed = this.authService.isAdmin()
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
