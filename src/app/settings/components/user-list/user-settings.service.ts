import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../auth/user.model';
import { AuthService } from '../../../auth/auth.service';
import { Error } from '../../../shared/models/error.model';
import { environment } from '../../../../environments/environment'



@Injectable({
    providedIn: 'root'
})
export class UserSettingsService {

    users = new BehaviorSubject<User[]>(undefined);
    loading = new BehaviorSubject<boolean>(false);
    error

    constructor(
        public http: HttpClient,
        public authService: AuthService
    ) { }


    loadAllUsers() {
        let that = this
        this.loading.next(true)
        this.http.get(
            environment.baseURL + "/accounts/",
            {
                headers: this.authService.headers(),
                observe: 'response'
            }
        ).subscribe(
            (response) => {
                this.loading.next(false)
                const users = response.body['data'].map(el => User.fromJSON(el))
                that.users.next(users)
            }, (errorResponse) => {
                this.authService.detectLogoutCondition(errorResponse)
                this.loading.next(false)
                this.error = Error.fromCode(errorResponse.status)
            },
        )
    }

    saveNewUser(user): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/accounts",
                user,
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        this.loading.next(false)
                        if (response.status !== 200) {
                            this.loading.next(false)
                            reject(response.body["error"]["message"])

                        } else {
                            this.loadAllUsers()
                            resolve()
                        }
                    }, (errorResponse) => {
                        this.loading.next(false)
                        reject(errorResponse.error.message)
                    }
                )
        })
    }

    updateUser(user, id) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/accounts/" + id,
                user,
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        this.loading.next(false)
                        if (response.status !== 200) {
                            this.loading.next(false)
                            reject(response.body["error"]["message"])

                        } else {
                            this.loadAllUsers()
                            resolve()
                        }
                    }, (errorResponse) => {
                        this.loading.next(false)
                        reject(errorResponse.error.message)
                    }
                )
        })

    }
}
