export class AppError extends Error{
    statuscode:number;
    constructor(message:string,statuscode:number){
        super(message)
        this.statuscode=statuscode;
    }
}

export class BadRequestError extends AppError{
    statuscode:number;
    constructor(message:string="Bad Request",statuscode:number){
        super(message,400)
        this.statuscode=statuscode;
    }
}
export class ProviderError extends AppError{
    statuscode:number;
    constructor(message:string,statuscode:number){
        super(message,502)
        this.statuscode=statuscode;
    }
}