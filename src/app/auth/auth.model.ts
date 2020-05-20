import { Error } from "../shared/models/error.model";
import { User } from "./user.model";

export class Auth {

    token: string
    user: User
    errors: Error[]

    constructor(token?: string, user?: User, errors?: Error[]) {
        this.token = token
        this.errors = errors;
        this.user = user
    }

    static fromJSON(d: Object): Auth {
        let obj = Object.assign(new Auth(), d);
        obj.user = User.fromJSON(d['user'])
        return obj
    }
}