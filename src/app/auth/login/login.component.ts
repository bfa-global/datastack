import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { Auth } from '../auth.model';
import { QueryParamsService } from '../../query-params.service';
import { filter } from 'rxjs/operators';
import { Error } from '../../shared/models/error.model'

const resetPasswordMode = 'reset-forgot-password'
const forgotPasswordMode = 'forgot-password'
const loginMode = 'login'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error: String
  isAuthenticated: Promise<Boolean>
  mode = 'login'
  params$
  tokenValidated = undefined
  tokenMessage = undefined
  token
  setPasswordSuccess = false

  constructor(
    public router: Router,
    public authService: AuthService,
    public queryParamService: QueryParamsService

  ) { }

  ngOnInit() {
    this.params$ = this.queryParamService.params.pipe(
      filter(params => params !== undefined && 'token' in params && params['token'] !== undefined && params['token'] !== '')
    ).subscribe(params => {
      this.mode = resetPasswordMode
      this.token = params["token"]
      this.verifyToken()
    })
  }

  verifyToken() {
    this.authService.validateForgotPasswordToken(this.token).then((valid: boolean) => {
      this.error = undefined;
      this.tokenValidated = valid
    }).catch((valid: boolean) => {
      console.warn("Forgot password token request failed")
    })
  }

  titleForMode() {
    let title
    switch (this.mode) {
      case forgotPasswordMode:
        title = "Forgot Password"
        break
      case resetPasswordMode:
        title = "Reset Password"
        break
      default:
        title = "Log In"
        break
    }
    return title
  }

  toggleMode(mode?) {
    if (mode !== undefined) {
      this.mode = mode
    } else {
      this.mode = this.mode === loginMode ? forgotPasswordMode : loginMode
    }
    this.error = undefined
  }

  formSubmit(f: NgForm) {
    this.authService.signIn(f.value.email, f.value.password)
      .then((auth: Auth) => {
        this.error = undefined;
        setTimeout(() => {
          this.router.navigate(['/app'])
        }, 500)
      }).catch((auth: Auth) => {
        console.warn("Error", auth.errors)
        this.error = auth.errors[0]['message']
      })
  }

  sendRecovery(email) {
    this.authService.forgotPassword(email)
      .then((auth: Auth) => {
        //TODO: send confirmation reset password request was successfull
      }).catch((auth: Auth) => {
        console.warn("Error", auth.errors)
        this.error = auth.errors[0]['message']
      })
  }

  setNewPasswords(password, confirmPassword) {
    this.authService.setNewPassword(this.token, password, confirmPassword)
      .then((error: Error) => {
        if (error.code === 200) {
          this.toggleMode(loginMode)
        }
        this.error = error['message']
      }).catch((error: Error) => {
        console.warn("Error", error)
        this.error = error['message']
      })

  }


}
