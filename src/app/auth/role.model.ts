import { ResourceRole } from "../settings/models/resource-role.model";

export class Role {

    _id: number
    name: string
    slug: string
    createdAt: string
    updatedAt: string
    description: string
    resourceRoles: ResourceRole[]

    constructor() {

    }

    static fromJSON(d: Object): Role {
        let obj = Object.assign(new Role(), d);
        if ("resourceRoles" in d) {
            const resourceRoles: object[] = d['resourceRoles']
            obj.resourceRoles = resourceRoles.map(el => ResourceRole.fromJSON(el))
        }
        return obj
    }
} 