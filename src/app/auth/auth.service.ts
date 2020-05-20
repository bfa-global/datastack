import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebStorageService, SESSION_STORAGE } from 'angular-webstorage-service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Auth } from './auth.model';
import { Error } from '../shared/models/error.model'
import { User } from './user.model';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { environment } from '../../environments/environment'

const authentication_key = 'authentication'


@Injectable()
export class AuthService {

  authentication = new BehaviorSubject<Auth>(undefined);
  loading = new BehaviorSubject<boolean>(false);
  loadingPasswordChange = new BehaviorSubject<boolean>(false);
  shownLogoutMessage = false
  bigQueryAccessToken

  constructor(
    public http: HttpClient,
    public router: Router,
    private notification: NzNotificationService,
    private message: NzMessageService,
    @Inject(SESSION_STORAGE) public storage: WebStorageService,
  ) {
    const storedAuth = this.getStoredAuth()
    if (storedAuth) {
      this.broadcastAuthChanged(storedAuth)
    }
  }

  isAuthenticated(): Promise<Auth> {
    return Promise.resolve(this.authentication.getValue())
  }

  isAdmin(): boolean {
    let admin = false
    const auth: Auth = this.authentication.getValue()
    if (auth && auth.user) {
      const user: User = auth.user
      admin = user.isAdmin()
    }
    return admin
  }

  signIn(email: string, password: string): Promise<Auth> {
    return new Promise<any>((resolve, reject) => {
      this.loading.next(true)
      this.http.post(
        environment.baseURL + "/auth/login",
        { 'email': email, 'password': password },
        { observe: 'response' }
      ).subscribe(
        (response) => {
          const auth = new Auth()
          if (response.status !== 200) {
            this.loading.next(false)
            auth.errors = [Error.fromCode(response.status)]
            reject(auth)
          } else {
            const token = response.body['token']
            this.getSelf(token).then((user: User) => {
              auth.user = user
              auth.token = token
              this.setStoredAuth(auth)
              resolve(auth)
            }).catch((error) => {
              this.loading.next(false)
              console.warn("Error", error)
              const auth = new Auth(undefined, undefined, [error])
              reject(auth)
            })
          }
        }, (errorResponse) => {
          this.loading.next(false)
          console.warn("Error", errorResponse)
          let auth = new Auth(undefined, undefined, [Error.fromCode(errorResponse.status)])
          reject(auth)
        }
      )
    })
  }

  getSelf(token?): Promise<User | Error> {
    token = token === undefined ? this.authentication.getValue()['token'] : token

    return new Promise<any>((resolve, reject) => {
      this.http.get(
        environment.baseURL + "/accounts/self",
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token
          }),
          observe: 'response'
        }
      ).subscribe(
        (response) => {
          this.loading.next(false)
          const user = User.fromJSON(response.body['data'])
          const currentAuth = this.authentication.getValue()
          if (currentAuth) {
            currentAuth.user = user
            this.setStoredAuth(currentAuth)
          }
          resolve(user)
        }, (errorResponse) => {
          this.loading.next(false)
          this.detectLogoutCondition(errorResponse)
          const error = Error.fromCode(errorResponse.status)
          reject(error)
        },
      )
    })
  }

  updateSelf(user: User): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.loading.next(true)
      this.http.post(
        environment.baseURL + "/accounts/self",
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        {
          headers: this.headers(),
          observe: 'response'
        }).subscribe(
          (response) => {
            this.loading.next(false)
            if (response.status !== 200) {
              this.loading.next(false)
              console.warn("Error", response)
              reject(response.body["error"]["message"])

            } else {
              this.getSelf()
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

  updateMyPassword(currentPassword, newPassword, confirmPassword): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.loadingPasswordChange.next(true)
      this.http.post(
        environment.baseURL + "/accounts/change-password",
        {
          previousPassword: currentPassword,
          password: newPassword,
          confirmPassword: confirmPassword
        },
        {
          headers: this.headers(),
          observe: 'response'
        }).subscribe(
          (response) => {
            this.loadingPasswordChange.next(false)
            if (response.status !== 200) {
              this.loadingPasswordChange.next(false)
              console.warn("Error", response)
              reject(response.body["error"]["message"])
            } else {
              resolve()
            }
          }, (errorResponse) => {
            this.loadingPasswordChange.next(false)
            console.warn("Error", errorResponse)
            reject(errorResponse.error.message)
          }
        )
    })
  }


  headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + this.authentication.getValue()["token"]
    })
  }

  detectLogoutCondition(errorResponse) {
    if (this.authentication.getValue() !== undefined && errorResponse.status === 401) {
      if ("error" in errorResponse.error && errorResponse.error["error"] === "TOKEN_EXPIRED") {
        if (this.shownLogoutMessage === false) {
          this.message.create('error', "Your session has expired. Please login to continue.");
          this.shownLogoutMessage = true
          setTimeout(() => {
            this.shownLogoutMessage = false
          }, 500);
        }
      }
      this.logout(true)
    }
  }

  forgotPassword(email: string): Promise<Auth> {
    return new Promise<any>((resolve, reject) => {
      this.loading.next(true)
      this.http.post(
        environment.baseURL + "/auth/forgot-password",
        { 'email': email, },
        { observe: 'response' }
      ).subscribe(
        (response) => {
          this.loading.next(false)
          let auth = new Auth()
          auth.errors = [new Error(response.status, response.body['message'])]
          reject(auth)
        }, (errorResponse) => {
          this.loading.next(false)
          console.warn("Error", errorResponse)
          let auth = new Auth(undefined, undefined, [Error.fromCode(errorResponse.status)])
          reject(auth)
        },
      )
    })
  }

  validateForgotPasswordToken(token) {
    return new Promise<boolean>((resolve, reject) => {
      this.loading.next(true)
      this.http.get(
        environment.baseURL + "/auth/check-token-validity?token=" + token,
        { observe: 'response' }
      ).subscribe(
        (response) => {
          this.loading.next(false)
          if (response.status !== 200) {
            resolve(false)
          }
          resolve(response.body["success"])
        }, (errorResponse) => {
          this.loading.next(false)
          console.warn("Error", errorResponse)
          if (errorResponse && errorResponse.status === 404) {
            resolve(false)
          } else {
            reject(undefined)
          }
        },
      )
    })

  }
  setNewPassword(token, password, confirmPassword) {
    return new Promise<Error>((resolve, reject) => {
      this.loading.next(true)
      this.http.post(
        environment.baseURL + "/auth/reset-password",
        { 'RESET_TOKEN': token, 'password': password, 'confirmPassword': confirmPassword },
        { observe: 'response' }
      ).subscribe(
        (response) => {
          this.loading.next(false)
          resolve(new Error(response.status, response.body['message']))
        }, (errorResponse) => {
          this.loading.next(false)
          reject(Error.fromCode(errorResponse.status))
        },
      )
    })

  }

  handleErrors() {

  }

  logout(error?) {
    this.setStoredAuth(undefined)
    let route = error ? '/login' : '/'
    this.router.navigate([route])
  }

  setStoredAuth(auth: Auth) {
    let authJSON = auth ? JSON.stringify(auth) : undefined
    this.storage.set(authentication_key, authJSON)
    this.broadcastAuthChanged(auth)
  }

  getStoredAuth(): Auth {
    let authJSON = this.storage.get(authentication_key)
    let auth = authJSON ? Auth.fromJSON(JSON.parse(authJSON)) : undefined
    return auth
  }

  broadcastAuthChanged(auth: Auth) {
    this.authentication.next(auth)
  }

  getBigQueryToken() {
    return new Promise<any>((resolve, reject) => {
      this.http.get(
        environment.baseURL + "/bigquery_tokens",
        { observe: 'response' }
      ).subscribe(
        (response) => {
          console.debug("RESPONSE", response)
          if (response.status !== 200) {
            console.debug("BigQuery Request Error", response.status)
            reject(response.status)
          } else {
            this.bigQueryAccessToken = response.body['access_token']
            resolve(this.bigQueryAccessToken)
          }
        }, (errorResponse) => {
          console.debug("BigQuery Auth Error", errorResponse)
          reject(errorResponse)
        }
      )
    })
  }
}


