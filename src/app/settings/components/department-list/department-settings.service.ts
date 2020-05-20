import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { Error } from '../../../shared/models/error.model';
import { Department } from '../../../auth/department.model';
import { UserSettingsService } from '../user-list/user-settings.service';
import { environment } from '../../../../environments/environment'


@Injectable({
    providedIn: 'root'
})
export class DepartmentSettingsService {

    departments = new BehaviorSubject<Department[]>(undefined);
    loading = new BehaviorSubject<boolean>(false);
    error

    constructor(
        public http: HttpClient,
        public authService: AuthService,
        public userSettingsService: UserSettingsService
    ) { }


    loadAllDepartments() {
        let that = this
        this.loading.next(true)
        this.http.get(
            environment.baseURL + "/departments/",
            {
                headers: this.authService.headers(),
                observe: 'response'
            }
        ).subscribe(
            (response) => {
                this.loading.next(false)
                const departments = response.body['data'].map(el => Department.fromJSON(el))
                that.departments.next(departments)
            }, (errorResponse) => {
                this.authService.detectLogoutCondition(errorResponse)
                this.loading.next(false)
                this.error = Error.fromCode(errorResponse.status)
            },
        )
    }

    saveNewDepartment(department): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/departments",
                department,
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
                            this.loadAllDepartments()
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

    updateDepartment(department, id) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/departments/" + id,
                department,
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
                            this.loadAllDepartments()
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

    transferUsersFromDepartmentToDepartment(fromDepartment, toDepartment) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.post(
                environment.baseURL + "/departments/" + fromDepartment['_id'] + "/transfer-users",
                { "destinationDepartment": toDepartment['_id'] },
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
                            this.loadAllDepartments()
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

    deleteDepartment(department: Department) {
        return new Promise<any>((resolve, reject) => {
            this.loading.next(true)
            this.http.delete(
                environment.baseURL + "/departments/" + department['_id'],
                {
                    headers: this.authService.headers(),
                    observe: 'response'
                }).subscribe(
                    (response) => {
                        this.loading.next(false)
                        if (response.body["success"] !== true) {
                            this.loading.next(false)
                            console.warn("Error", response)
                            reject(response.body["message"])

                        } else {
                            this.loadAllDepartments()
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