import { Department } from "./department.model";
import { Role } from "./role.model";

export class User {

    _id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    isAuperAdmin: boolean
    createdAt: string
    updatedAt: string
    lastLogin: string
    department: Department
    role: Role
    isDisabled: boolean

    constructor() {
        this.department = new Department()
        this.role = new Role()
    }

    static fromJSON(d: Object): User {
        let obj = Object.assign(new User(), d);
        obj.department = Department.fromJSON(d["department"]);
        obj.role = Role.fromJSON(d["role"]);
        return obj
    }

    public isAdmin(): boolean {
        return this.role.slug === "admin"
    }

    isAuthenticatedForGroup(group: string[]): boolean {
        let isAuthenticated = true
        // TODO: When API communicates what dashboards are available, this is where they will be set
        return isAuthenticated
    }
} 