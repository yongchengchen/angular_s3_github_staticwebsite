import * as AWS from "aws-sdk/global";
import * as S3 from "aws-sdk/clients/s3";
import * as fs from "fs";

import { S3_OPTIONS } from './lib/interfaces';

/**
 * Created by Yongcheng Chen
 */

export class AwsS3Service {
    private s3:S3;
    constructor(private options?:S3_OPTIONS) {
        if (this.options) {
            AWS.config.credentials = new AWS.Credentials(this.options.clientID, this.options.secret);
            AWS.config.update({
                region: this.options.region,
            });
        }
        this.getS3();
    }

    private getS3(): any {
        let clientParams:any = {
            apiVersion: '2006-03-01'
        };
        
        this.s3 = new S3(clientParams);
    }

    addFile(filefullpath:string, asKey:string, toBucket:string) {
        let pthis = this;
        fs.readFile(filefullpath, function (err, data) {
            if (err) { throw err; }
            let params = {
                Body: data,
                Bucket: toBucket, 
                Key: asKey,
                ACL:'public-read'
            };
            pthis.s3.putObject(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        });
    }
}
