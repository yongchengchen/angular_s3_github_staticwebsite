// //<reference path="node.d.ts" />

// import { App } from './app';

// App.getInstance().run()

import { Github, GITHUB_API_V3_REPO_CONTENT } from './github';
import { DataService } from './data.service';
import { AwsS3Service } from './aws.s3.service';

import * as fs from "fs";

const clientId = 'put your client here';
const secret = 'put your secret here';

async function main() {
  try {
    let dataSvc = new DataService();
    
    let github = new Github('yongchengchen');
    let readme = await github.getReadme('ngstaticblog');
    let buf = Buffer.from(readme['content'], 'base64');
    let config = dataSvc.parseSummary(buf.toString());

    let filelist:GITHUB_API_V3_REPO_CONTENT[] = <GITHUB_API_V3_REPO_CONTENT[]>await github.getContents('ngstaticblog', 'content');

    let articles = await dataSvc.generateStructor(filelist);
    config['posts'] = articles;
    fs.writeFileSync('/tmp/articles.json', JSON.stringify(config));
    let s3 = new AwsS3Service(clientId, secret, 'ap-southeast-2');
    s3.addFile('/tmp/articles.json', 'assets/articles.json', 'tonychenblog');
  } catch(error) {
    console.error(error);
  } 
}

main();
