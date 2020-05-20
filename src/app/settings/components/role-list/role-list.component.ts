import { Component, OnInit } from '@angular/core';
import { RoleSettingsService } from './role-settings.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Role } from '../../../auth/role.model';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { Resource } from '../../models/resource.model';
import { ResourceRole } from '../../models/resource-role.model';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {

  dtOptions
  dtTrigger: Subject<boolean> = new Subject();
  roles: Role[] = []
  resources: Resource[] = []

  modalRole
  modalRoleVisible
  modalRoleError

  modalPermissionRole
  modalPermissionVisible
  modalPermissionError

  showAddResource
  newResource

  modalRoleTransferVisible
  modalRoleTransferError
  modalRoleTransfer
  fromRole
  toRole

  resourceRole

  constructor(
    public roleSettingsService: RoleSettingsService,
    private notification: NzNotificationService,
    private message: NzMessageService

  ) { }

  ngOnInit() {
    this.modalRole = new Role()
    this.modalPermissionRole = new Role()
    this.subscribeRoles()
    this.subscribeResources()
  }

  subscribeRoles() {
    this.roleSettingsService.loadAllRoles();
    this.roleSettingsService.roles.subscribe(roles => {
      this.roles = roles
      this.dtTrigger.next()

      if (roles && this.modalPermissionRole !== undefined) {
        for (let role of roles) {
          if (role._id === this.modalPermissionRole._id) {
            this.modalPermissionRole = role
          }
        }
      }
    })
  }
  subscribeResources() {
    this.roleSettingsService.loadAllResources();
    this.roleSettingsService.resources.subscribe(resources => {
      this.resources = resources

    })
  }

  showNewRoleModal() {
    this.modalRole = new Role()
    this.showRoleModal()
  }
  showRoleModal() {
    this.modalRoleVisible = true
  }

  closeRoleForm() {
    this.modalRoleVisible = false;
  }

  showEditRoleModal(role) {
    this.modalRole = role;
    this.showRoleModal()
  }

  showEditPermissionModal(role) {
    this.modalPermissionRole = role;
    this.modalPermissionVisible = true
  }

  closePermissionForm() {
    this.modalPermissionVisible = false;
  }


  submitRole(f: NgForm) {
    const role = {
      name: f.value.name
    }
    let promise
    if (this.modalRole._id === undefined) {
      promise = this.roleSettingsService.saveNewRole(role)
    } else if (this.modalRole._id !== undefined) {
      promise = this.roleSettingsService.updateRole(role, this.modalRole["_id"])
    }
    promise
      .then(() => {
        this.closeRoleForm()
        this.clearRoleForm(f)
      }).catch((error) => {
        this.modalRoleError = error
      })
  }

  clearRoleForm(f: NgForm) {
    f.reset()
    this.modalRoleError = undefined
  }


  deleteRole(role) {
    this.roleSettingsService.deleteRole(role).then(() => {
      this.message.success("Successfully deleted role '" + role.name + "'.");
    }).catch((error) => {
      this.notification.blank(
        'Error',
        error,
        { nzDuration: 0 }
      )
    })
  }

  resourceRoleHasPermission(resourceRole, permissionType) {
    for (let permission of resourceRole.permissions) {
      if (permission["name"] === permissionType) {
        return true
      }
    }
    return false
  }

  togglePermission(enabled, permissionType, resourceRole: ResourceRole) {
    let call
    if (enabled) {
      call = this.roleSettingsService.addPermission(resourceRole.resource, resourceRole._id, permissionType)
    } else {
      const permission = resourceRole.permissionForType(permissionType)
      if (permission) {
        call = this.roleSettingsService.deletePermission(resourceRole.resource._id, permission._id)
      }
    }

    call.then(() => {
      this.message.success("Successfully " + (enabled ? "added" : "removed") + " " + permissionType + " access to '" + resourceRole.resource.name + "'.");
    }).catch((error) => {
      this.notification.blank(
        'Error',
        error,
        { nzDuration: 0 }
      )
    })
  }

  roleHasAllResources(role: Role): boolean {

    for (let resource of this.resources) {
      if (!this.roleHasResource(role, resource)) {
        return false
      }
    }
    return true
  }

  roleHasResource(role: Role, resource: Resource): boolean {
    let hasResource = false;
    for (let resourceRole of role.resourceRoles) {
      if (resource._id === resourceRole.resource._id) {
        hasResource = true;
        break
      }
    }
    return hasResource;
  }

  addResourceRole(role, resource) {
    this.roleSettingsService.addResourceRole(role, resource).then(() => {
      this.newResource = undefined
      this.message.success("Successfully added access to '" + resource.name + "' for '" + role.name + "'.");
    }).catch((error) => {
      this.notification.blank(
        'Error',
        error,
        { nzDuration: 0 }
      )
    })
  }

  showTransfer(role) {
    this.fromRole = role
    this.modalRoleTransferVisible = true
  }

  closeTransferDeptForm() {
    this.modalRoleTransferVisible = false;
    this.modalRoleTransferError = undefined
    this.fromRole = undefined
    this.toRole = undefined
  }

  initiateTransfer() {
    this.roleSettingsService.transferUsersFromRoleToRole(this.fromRole, this.toRole).then(() => {
      this.message.success("Successfully transferred users to '" + this.toRole.name + "'.");
      this.closeTransferDeptForm();
    }).catch((error) => {
      this.modalRoleTransferError = error
    })
  }
}