import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../auth/user.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  profileForm: FormGroup;
  profileMessageSuccess
  profileMessageError
  passwordForm: FormGroup;
  passwordMessageSuccess
  passwordMessageError

  constructor(
    public fb: FormBuilder,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const auth = this.authService.authentication.getValue()
    const user = auth.user
    this.profileForm = this.fb.group({
      firstName: [user.firstName, [Validators.required]],
      lastName: [user.lastName, [Validators.required]],
      email: [user.email, [Validators.email, Validators.required]],
      phoneNumber: [user.phone, [Validators.required]],
    });
    this.passwordForm = this.fb.group({
      oldPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  submitProfileForm(): void {
    for (const i in this.profileForm.controls) {
      this.profileForm.controls[i].markAsDirty();
      this.profileForm.controls[i].updateValueAndValidity();
    }
    const user = new User()
    user.firstName = this.profileForm.controls['firstName'].value
    user.lastName = this.profileForm.controls['lastName'].value
    user.email = this.profileForm.controls['email'].value
    user.phone = this.profileForm.controls['phoneNumber'].value
    this.authService.updateSelf(user).then(() => {
      this.profileMessageSuccess = "Update Successful"
      this.profileMessageError = undefined
    }).catch((error) => {
      this.profileMessageSuccess = undefined
      this.profileMessageError = error
    })
  }
  submitPasswordForm(): void {
    for (const i in this.passwordForm.controls) {
      this.passwordForm.controls[i].markAsDirty();
      this.passwordForm.controls[i].updateValueAndValidity();
    }

    const oldPassword = this.passwordForm.controls['oldPassword'].value
    const newPassword = this.passwordForm.controls['newPassword'].value
    const checkPassword = this.passwordForm.controls['checkPassword'].value

    this.authService.updateMyPassword(oldPassword, newPassword, checkPassword).then(() => {
      this.passwordMessageSuccess = "Update Successful"
      this.passwordMessageError = undefined
    }).catch((error) => {
      this.passwordMessageSuccess = undefined
      this.passwordMessageError = error
    })
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.passwordForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.passwordForm.controls.newPassword.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }


}
