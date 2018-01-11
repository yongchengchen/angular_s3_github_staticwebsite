//<reference path="node.d.ts" />

import { Helper } from './lib/helper';
import * as https from "https";
import { KeyValueDic } from './lib/interfaces'
import { HttpClient } from './lib/http.client'

const githubtoken = 'put your github token here';

interface Links {
    self: string;
    git: string;
    html: string;
}

export interface GITHUB_API_V3_REPO_CONTENT {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: Links;
  }

export class Github {
    private readonly baseUrl:string = 'api.github.com';
    private readonly version:string = 'v3';

    private reqDic:KeyValueDic<number>= {};
    private respDic:KeyValueDic<GITHUB_API_V3_REPO_CONTENT[]>= {};
    
    constructor(private owner:string) {
        HttpClient.getInstance().addPlugin(options=>{
            options['headers']['Authorization'] = 'token ' + githubtoken;
            return options;
        })
    }


    public getReadme(repos:string) {
        let pthis = this;
        return new Promise(function(resolve, reject) {
            let path:string = [pthis.baseUrl, 'repos', pthis.owner, repos, 'readme'].join('/')
            let timestamp = new Date();
            HttpClient.getInstance().get(path + '?' + timestamp.getTime(),
                (err:boolean, resp:string)=>{
                    if (err) {
                        reject(resp);
                    } else {
                        resolve(JSON.parse(resp));
                    }
                })
        });
    }

    //#region repos contents API
    public getContents(repos:string, directory?:string) {
        let pthis = this;
        directory = directory?directory:'';
        let reqKey:string = ['contents:', repos, directory].join('/')
        return new Promise(function(resolve, reject) {
            if (pthis.reqDic[reqKey] !== undefined) {
                reject('Please wait another repo contents request finishd first!')
            } else {
                pthis.reqDic[reqKey] = 0;
                pthis.respDic[reqKey] = [];
                pthis.requestContents(reqKey, repos, directory?directory:'', resolve, reject)
            }
        });
    }

    private requestContents(reqKey:string, repos:string, directory:string, resolve:(value?:{}|PromiseLike<{}>)=>void, reject:(reason?:any)=> void) {
        this.reqDic[reqKey] = this.reqDic[reqKey] + 1;
        // /repos/:owner/:repo/contents/:path
        let timestamp = new Date();
        HttpClient.getInstance().get([this.baseUrl, 'repos', this.owner, repos, 'contents', directory ? directory:''].join('/') + '?' + timestamp.getTime(),
            (err:boolean, resp:string)=>{
                this.reqDic[reqKey] = this.reqDic[reqKey] - 1;
                if (err) {
                    reject(resp);
                } else {
                    this.parseContentsResp(reqKey, repos, resp, resolve, reject);
                }
        })
    }

    private parseContentsResp(reqKey:string, repos:string, resp:string, resolve:(value?:{}|PromiseLike<{}>)=>void, reject:(reason?:any)=> void) {
        let contents:GITHUB_API_V3_REPO_CONTENT[] = <GITHUB_API_V3_REPO_CONTENT[]>JSON.parse(resp);
        this.respDic[reqKey] = contents.concat(this.respDic[reqKey]);
        for(let item of contents) {
            if (item.type == 'dir') {
                this.requestContents(reqKey, repos, item.path, resolve, reject);
            }
        }
        if (this.reqDic[reqKey] == 0) {
            delete this.reqDic[reqKey];
            resolve(this.respDic[reqKey]);
        }
    }
    //#endregion
}
