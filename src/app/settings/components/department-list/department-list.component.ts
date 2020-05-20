import { Component, OnInit } from '@angular/core';
import { DepartmentSettingsService } from './department-settings.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Department } from '../../../auth/department.model';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {

  dtOptions
  dtTrigger: Subject<boolean> = new Subject();
  departments = []

  modalDepartmentVisible
  modalDepartmentError
  modalDepartment

  modalDepartmentTransferVisible
  modalDepartmentTransferError
  modalDepartmentTransfer
  fromDepartment
  toDepartment

  constructor(
    public departmentSettingsService: DepartmentSettingsService,
    private notification: NzNotificationService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.modalDepartment = new Department()
    this.departmentSettingsService.loadAllDepartments();
    this.subscribeDepartments()

  }

  subscribeDepartments() {
    this.departmentSettingsService.departments.subscribe(departments => {
      this.departments = departments
      this.dtTrigger.next()
    })
  }

  showNewDepartmentModal() {
    this.modalDepartment = new Department()
    this.showDepartmentModal()
  }

  showDepartmentModal() {
    this.modalDepartmentVisible = true
  }

  showEditDepartmentModal(department) {
    this.modalDepartment = department;
    this.showDepartmentModal()
  }

  submitDepartment(f: NgForm) {

    const department = {
      'name': f.value.name,
      'description': f.value.description
    }

    let promise
    if (this.modalDepartment._id === undefined) {
      promise = this.departmentSettingsService.saveNewDepartment(department)
    } else if (this.modalDepartment._id !== undefined) {
      promise = this.departmentSettingsService.updateDepartment(department, this.modalDepartment._id)
    }
    promise
      .then(() => {
        this.closeDeptForm()
        this.clearDeptForm(f)
      }).catch((error) => {
        this.modalDepartmentError = error
      })
  }

  clearDeptForm(f: NgForm) {
    f.reset()
    this.modalDepartmentError = undefined
  }

  closeDeptForm() {
    this.modalDepartmentVisible = false;
  }

  showTransferForDepartment(department) {
    this.fromDepartment = department
    this.modalDepartmentTransferVisible = true
  }

  closeTransferDeptForm() {
    this.modalDepartmentTransferVisible = false;
    this.modalDepartmentTransferError = undefined
    this.fromDepartment = undefined
    this.toDepartment = undefined
  }

  deleteDepartment(department) {
    this.departmentSettingsService.deleteDepartment(department).then(() => {
      this.message.success("Successfully deleted department '" + department.name + "'.");
    }).catch((error) => {
      console.warn("Error", error)
      this.notification.blank(
        'Error',
        error,
        { nzDuration: 0 }
      )
    })
  }

  initiateTransfer() {
    this.departmentSettingsService.transferUsersFromDepartmentToDepartment(this.fromDepartment, this.toDepartment).then(() => {
      this.message.success("Successfully transferred users to '" + this.toDepartment.name + "'.");
      this.closeTransferDeptForm();
    }).catch((error) => {
      console.warn("Error", error)
      this.modalDepartmentTransferError = error
    })
  }


}
