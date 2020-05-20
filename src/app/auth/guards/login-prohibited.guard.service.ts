import { Injectable } from '@angular/core';
import { Router, Route, CanLoad, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Auth } from '../auth.model';

@Injectable({
  providedIn: 'root'
})
export class LoginProhibitedGuardService implements CanLoad, CanActivate {

  constructor(public authService: AuthService,
    public router: Router) { }


  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return this.canAccess(route)
  }
  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canAccess(route)
  }

  canAccess(route) {
    return this.authService.isAuthenticated()
      .then((authenticated: Auth) => {
        if (authenticated && authenticated.token) {
          this.router.navigate(['/app/'])
          return false;
        } else {
          return true;
        }
      }
      ).catch((error) => {
        return false;
      })
  }

}
