//#region listobjects interface
export interface AWS_S3_LISTOBJECTS_COMMONPREFIXES_ITEM {
    Prefix:string
}

export interface AWS_S3_LISTOBJECTS_CONTENT_ITEM {
    Key:string,
    LastModified:string,
    ETag:string,
    Size:number,
    StorageClass:string,
    ng_url?:string,
    res_url?:string,
    categories?:string[],
    title?:string,
    image?:string
}

export interface AWS_S3_LISTOBJECTS_RESPONSE {
    IsTruncated:boolean,
    CommonPrefixes:AWS_S3_LISTOBJECTS_COMMONPREFIXES_ITEM[],
    Contents:AWS_S3_LISTOBJECTS_CONTENT_ITEM[],
    Name:string,
    Prefix?:string,
    MaxKeys:number,
    KeyCount:number
}
//#endregion 


export interface AWS_S3_GETOBJECT_RESPONSE {
    Body:Uint8Array,
    ContentType:string,
    LastModified:string,
    Metadata:any    
}
