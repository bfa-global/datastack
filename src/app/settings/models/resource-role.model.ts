import { Permission } from "./permission.model";
import { resource } from "selenium-webdriver/http";
import { Resource } from "./resource.model";

export class ResourceRole {

    _id: number
    permissions: Permission[]
    resource: Resource

    constructor() {

    }

    static fromJSON(d: Object): ResourceRole {
        let obj = Object.assign(new ResourceRole(), d);
        obj.permissions = d["permissions"].map(el => Permission.fromJSON(el))
        obj.resource = Resource.fromJSON(obj.resource)
        return obj
    }

    permissionForType(type): Permission {
        for (let permission of this.permissions) {
            if (permission.name === type) {
                return permission
            }
        }
        return undefined
    }
} 