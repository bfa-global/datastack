export class Error {

    code: number
    message: string

    static fromCode(code, message?: string) {
        switch (code) {
            case 401: {
                return this.unauthorized(message);
                break;
            }
            case 403: {
                return this.forbidden(message);
                break;
            }
            default: {
                return this.generic(code)
                break;
            }
        }
    }

    static unauthorized(message?: string) {
        return new Error(401, message ? message : "Unauthorized.")
    }

    static forbidden(message?: string) {
        return new Error(403, message ? message : "Forbidden. You do not have access.")
    }

    static generic(code, message?: string) {
        message = message ? message : "An error has occured."
        return new Error(code, message)
    }

    constructor(code?: number, message?: string) {
        this.code = code
        this.message = message;
    }
}