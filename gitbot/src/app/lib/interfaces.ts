export interface KeyValuePair<T> {
    key: string;
    value: T;
}

export interface KeyValueDic<T> {
    [key: string]:T
}

export function getConstructor(value:any) {
    let prototype:any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
    return prototype.constructor;
}

export class Singleton {
    protected static instance:any;
    protected constructor() {}
    static getInstance() {
        if (!this.instance) {
            let construct = getConstructor(this);
            this.instance = new construct();
        }
        return this.instance;
    }
}

export interface GITHUB_OPTIONS {
    owner:string
    repos:string,
    token:string,
}

export interface S3_OPTIONS {
    clientID:string
    secret:string,
    region?:string
}
