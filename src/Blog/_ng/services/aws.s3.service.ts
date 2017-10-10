import { Injectable } from '@angular/core';
// import {CognitoUtil} from "./cognito.service";
import * as AWS from "aws-sdk/global";
import * as S3 from "aws-sdk/clients/s3";

import { AWS_CONFIG } from "./aws.config";

/**
 * Created by Yongcheng Chen
 */

@Injectable()
export class AwsS3Service {
    private s3:S3;
    constructor() {
        AWS.config.credentials = new AWS.Credentials(AWS_CONFIG.clientId, AWS_CONFIG.secret);
        this.getS3();
    }

    private getS3(): any {
        AWS.config.update({
            region: AWS_CONFIG.region,
        });

        let clientParams:any = {
            region: AWS_CONFIG.region,
            apiVersion: '2006-03-01'
        };
        
        if (AWS_CONFIG.s3_endpoint) {
            clientParams.endpoint = AWS_CONFIG.s3_endpoint;
        }

        this.s3 = new S3(clientParams);
    }

    public list(category:string, callback:(err:any, data:any)=>void, bucket?:string) {
        let parameters = {Bucket: bucket ? bucket : AWS_CONFIG.bucket};
        if (category && category != '' && category !='/') {
            parameters['Prefix'] = encodeURIComponent(category) + '/';
        } else {
            //parameters['Delimiter'] = '/';
        }

        this.s3.listObjectsV2(parameters, callback);
    }

    public getObject(key:string, callback:(err:any, data:any)=>void, bucket?:string) {
        let parameters = {
            Bucket:bucket ? bucket : AWS_CONFIG.bucket,
            Key:key
        };
        
        this.s3.getObject(parameters, callback);
    }
}