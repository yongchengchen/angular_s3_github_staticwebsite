import * as AWS from "aws-sdk/global";
import * as S3 from "aws-sdk/clients/s3";

import * as fs from "fs";

/**
 * Created by Yongcheng Chen
 */

export class AwsS3Service {
    private s3:S3;
    constructor(clientId:string, secret:string, region:string,) {
        AWS.config.credentials = new AWS.Credentials(clientId, secret);
        this.getS3(region);
    }

    private getS3(region:string): any {
        AWS.config.update({
            region: region,
        });

        let clientParams:any = {
            region: region,
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
                Key: asKey
            };
            pthis.s3.putObject(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        });
    }
}
