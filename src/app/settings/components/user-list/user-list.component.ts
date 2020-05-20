import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { User } from '../../../auth/user.model';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { UserSettingsService } from './user-settings.service';
import { DepartmentSettingsService } from '../department-list/department-settings.service';
import { RoleSettingsService } from '../role-list/role-settings.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  dtOptions
  dtTrigger: Subject<boolean> = new Subject();
  users = []
  modalUserVisible
  modalUserError
  modalUser

  constructor(
    public userSettingsService: UserSettingsService,
    public departmentSettingsService: DepartmentSettingsService,
    public roleSettingsService: RoleSettingsService,
    private notification: NzNotificationService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.modalUser = new User()
    this.userSettingsService.loadAllUsers();
    this.subscribeUsers()
  }

  subscribeUsers() {
    this.userSettingsService.users.subscribe(users => {
      this.users = users
      this.dtTrigger.next()
    })
  }

  showNewUserModal() {
    this.modalUser = new User()
    this.showUserModal()
  }
  showUserModal() {
    this.modalUserVisible = true
  }

  showEditUserModal(user) {
    this.modalUser = user;
    this.showUserModal()
  }


  submitUser(f: NgForm) {
    const user = {
      firstName: f.value.firstName,
      lastName: f.value.lastName,
      email: f.value.email,
      phone: f.value.phone,
      role: this.modalUser.role._id,
      department: this.modalUser.department._id
    }

    let promise
    if (this.modalUser._id === undefined) {
      promise = this.userSettingsService.saveNewUser(user)
    } else if (this.modalUser._id !== undefined) {
      promise = this.userSettingsService.updateUser(user, this.modalUser._id)
    }

    promise
      .then(() => {
        this.closeUserForm()
        this.clearUserForm(f)
      }).catch((error) => {
        this.modalUserError = error
      })
  }

  flipActiveState(user) {
    const state = { isDisabled: !user.isDisabled }
    this.userSettingsService.updateUser(state, user._id).then(() => {
      const message = "Successfully " + (user.isDisabled ? "enabled" : "disabled") + ' user ' + user.firstName + " " + user.lastName + '.'
      this.message.success(message);
    }).catch((error) => {
      this.notification.blank(
        'Error',
        error,
        { nzDuration: 0 }
      )
    })
  }

  clearUserForm(f: NgForm) {
    f.reset()
    this.modalUserError = undefined
  }

  closeUserForm() {
    this.modalUserVisible = false;
  }
}
