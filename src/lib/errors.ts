export class AppError extends Error {
    statuscode: number;
    name:string;
    constructor(message:string,statuscode:number) {
        super(message);
        this.name = "AppError";
        this.statuscode = statuscode;
    }
}

export class BadRequestError extends AppError{
    constructor(message="Bad Request",statuscode=400) {
        super(message, statuscode);
        this.name="BadRequestError";
    }
}
export class RateLimitError extends AppError{
    constructor(message="Rate Limit Reached",statuscode=429){
        super(message, statuscode);
        this.name = "RateLimitError";
    }
}
export class AuthError extends AppError{
    constructor(message="Authentication error",statuscode=429){
        super(message, statuscode);
        this.name = "AuthError";
    }
}

export class ProviderError extends AppError {
    constructor(message:string="Provider returned Error",statuscode=502){
        super(message, statuscode);
        this.name="ProviderError";
    }
}