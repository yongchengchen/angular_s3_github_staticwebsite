// //<reference path="node.d.ts" />
import * as util from 'util';
import { AwsCredentials } from 'aws-sdk/clients/gamelift';
import { Github, GITHUB_API_V3_REPO_CONTENT } from './github';
import { DataService } from './data.service';
import { AwsS3Service } from './aws.s3.service';

import { GITHUB_OPTIONS, S3_OPTIONS } from './lib/interfaces';

import * as fs from 'fs';

async function run(githubOp:GITHUB_OPTIONS, s3Options?:S3_OPTIONS) {
  try {
    let dataSvc = new DataService();
    
    // let github = new Github('yongchengchen');
    let github = new Github(githubOp);
    let readme = await github.getReadme(githubOp.repos);
    let buf = Buffer.from(readme['content'], 'base64');
    let config = dataSvc.parseSummary(buf.toString());

    let filelist:GITHUB_API_V3_REPO_CONTENT[] = <GITHUB_API_V3_REPO_CONTENT[]>await github.getContents(githubOp.repos, 'content');

    let articles = await dataSvc.generateStructor(filelist);
    config['posts'] = articles;
    fs.writeFileSync('/tmp/articles.json', JSON.stringify(config));
    let s3 = new AwsS3Service(s3Options);
    s3.addFile('/tmp/articles.json', 'assets/articles.json', 'zencodelife.me');
  } catch(error) {
    console.error(error);
  } 
}

export function lambdaentry (event, context, callback) {
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    let githubOp = {
        owner: process.env.GITHUB_OWNER,
        repos: process.env.GITHUB_REPOS,
        token: process.env.GITHUB_TOKEN
    };
    run(githubOp);
    callback(null, 'finished');
};
