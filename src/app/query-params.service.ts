import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class QueryParamsService implements CanActivate {

  params = new BehaviorSubject<object>({})

  constructor(public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    return this.canAccess(route.queryParams)
  }

  canAccess(params: object) {
    return new Promise<boolean>((resolve, reject) => {
      this.updateQueryParams(params, false)
      resolve(true) // don't block access, only sets params
    })
  }



  updateQueryParams(params, update?) {
    update = update === undefined ? true : update
    setTimeout(() => {
      const allParams = { ...this.params.getValue(), ...params }
      this.params.next(allParams)
      if (update) {
        this.router.navigate([], {
          queryParams: allParams
        })
      }
    }, 1)
  }

}
