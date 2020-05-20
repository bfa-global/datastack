import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { Error } from '../../../shared/models/error.model';
import { Role } from '../../../auth/role.model';
import { Resource } from '../../models/resource.model';
import { UserSettingsService } from '../user-list/user-settings.service';
import { environment } from '../../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class RoleSettingsService {

    roles = new BehaviorSubject<Role[]>(undefined);
    resources = new BehaviorSubject<Resource[]>(undefined);
    loading = new BehaviorSubject<boolean>(false);
    error

    constructor(
        public userSettingsService: UserSettingsService,
        public http: HttpClient,
        public authService: AuthService
    ) { }


    loadAllRoles() {
        let that = this
        this.loading.next(true)
        this.http.get(
            environment.baseURL + "/roles/",
            {
                headers: this.authService.headers(),
                observe: 'response'
            }
        ).subscribe(
            (response) => {
                this.loading.next(false)
                const roles = response.body['data'].map(el => Role.fromJSON(el))
                that.roles.next(roles)
            }, (errorResponse) => {
                this.authService.detectLogoutCondition(errorResponse)
                this.loading.next(false)
                this.error = Error.fromCode(errorResponse.status)
            },
        )
    }

    loadAllResources() {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.get(
                environment.baseURL + "/resources",
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }
            ).subscribe(
                (response) => {
                    this.loading.next(false)
                    const resources = response.body['data'].map(el => Resource.fromJSON(el))
                    this.resources.next(resources)
                }, (errorResponse) => {
                    this.authService.detectLogoutCondition(errorResponse)
                    this.loading.next(false)
                    this.error = Error.fromCode(errorResponse.status)
                },
            )
        })

    }

    saveNewRole(role): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/roles",
                { 'name': role.name },
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
                            this.loadAllRoles()
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

    updateRole(role, id): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/roles/" + id,
                { 'name': role.name },
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
                            this.userSettingsService.loadAllUsers()
                            this.loadAllRoles()
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

    deleteRole(role: Role): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.delete(
                environment.baseURL + "/roles/" + role._id,
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
                            this.userSettingsService.loadAllUsers()
                            this.loadAllRoles()
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

    addResourceRole(role, resource) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/resources/" + resource._id + "/roles",
                { 'roleId': role._id },
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        this.loading.next(false)
                        if (response.status !== 200) {
                            console.warn("Error", response)
                            reject(response.body["error"]["message"])

                        } else {
                            this.loadAllRoles()
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

    addPermission(resourceId, resourceRoleId, type) {
        return new Promise<any>((resolve, reject) => {
            this.http.post(
                environment.baseURL + "/resources/" + resourceId + "/resource-roles/" + resourceRoleId + "/permissions",
                { 'name': type },
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        if (response.status !== 200) {
                            console.warn("Error", response)
                            reject(response.body["error"]["message"])

                        } else {
                            this.loadAllRoles()
                            resolve()
                        }
                    }, (errorResponse) => {
                        console.warn("Error", errorResponse)
                        reject(errorResponse.error.message)
                    }
                )
        })
    }

    deletePermission(resourceId, permissionId) {
        return new Promise<any>((resolve, reject) => {
            this.http.request(
                'delete',
                environment.baseURL + "/resources/" + resourceId + "/permissions",
                {
                    headers: this.authService.headers(),
                    body: { "permissionId": permissionId },
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        if (response.status !== 200) {
                            console.warn("Error", response)
                            reject(response.body["error"]["message"])

                        } else {
                            this.userSettingsService.loadAllUsers()
                            this.loadAllRoles()
                            resolve()
                        }
                    }, (errorResponse) => {
                        console.warn("Error", errorResponse)
                        reject(errorResponse.error.message)
                    }
                )
        })
    }

    transferUsersFromRoleToRole(fromRole, toRole) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/roles/" + fromRole['_id'] + "/transfer-users",
                { "destinationRole": toRole['_id'] },
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
                            this.loadAllRoles()
                            this.userSettingsService.loadAllUsers()//update depts associated with users
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