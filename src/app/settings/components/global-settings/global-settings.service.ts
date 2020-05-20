import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { Error } from '../../../shared/models/error.model';
import { Role } from '../../../auth/role.model';
import { Setting } from '../../models/setting.model';
import { environment } from '../../../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  settings = new BehaviorSubject<Role[]>(undefined);
  loading = new BehaviorSubject<boolean>(false);
  error

  constructor(
    public http: HttpClient,
    public authService: AuthService
  ) { }

  loadAllGlobalSettings() {
    let that = this
    this.loading.next(true)
    this.http.get(
      environment.baseURL + "/settings/",
      {
        headers: this.authService.headers(),
        observe: 'response'
      }
    ).subscribe(
      (response) => {
        this.loading.next(false)
        const settings = response.body['data'].map(el => Setting.fromJSON(el))
        that.settings.next(settings)
      }, (errorResponse) => {
        this.authService.detectLogoutCondition(errorResponse)
        this.loading.next(false)
        this.error = Error.fromCode(errorResponse.status)
      },
    )
  }

  saveNewSetting(id, value): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.loading.next(true)
      this.http.post(
        environment.baseURL + "/settings/" + id,
        value,
        {
          headers: this.authService.headers(),
          observe: 'response'
        }).subscribe(
          (response) => {
            this.loading.next(false)
            if (response.status !== 200) {
              this.loading.next(false)
              console.warn("Error", response)
              reject(response.body["error"]["message"])

            } else {
              this.loadAllGlobalSettings()
              resolve()
            }
          }, (errorResponse) => {
            this.loading.next(false)
            console.warn("Error", errorResponse)
            reject(errorResponse.error.message)
          }
        )
    })
  }

}
