//<reference path="node.d.ts" />

import { Helper } from './lib/helper';
import { KeyValueDic } from './lib/interfaces'
import { HttpClient } from './lib/http.client'
import { GITHUB_API_V3_REPO_CONTENT } from './github';

interface ARTICLE {
    title:string,
    url?:string,
    date:string,
    tags?:string[],
    categories:string[],
    description?:string
}

export class DataService {
    // private categories:GITHUB_API_V3_REPO_CONTENT[] = [];
    private articles:ARTICLE[] = [];

    private reqAmount:number = 0;

    public generateStructor(list: GITHUB_API_V3_REPO_CONTENT[]) {
        let pthis = this;
        return new Promise(function(resolve, reject) {
            for(let item of list) {
                if (item.type == 'file') {
                    pthis.analyseMDfile(item, resolve, reject);
                // } else { //dir
                //     pthis.categories.push(item);
                }
            }
        });
    }

    private analyseMDfile(item:GITHUB_API_V3_REPO_CONTENT, resolve:(value?:{}|PromiseLike<{}>)=>void, reject:(reason?:any)=> void) {
        this.reqAmount++;
        let timestamp = new Date();

        HttpClient.getInstance().get(item.download_url + '?' + timestamp.getTime(), (err:boolean, resp:string)=>{
            let article:ARTICLE = <ARTICLE>this.parseSummary(resp);
            article.url = item.download_url;
            this.articles.push(article);
            if (--this.reqAmount ==0) {
                resolve(this.articles);
            }
        })
    }

    public parseSummary(data:string) {
        let re = /<!--[^>]*-->/g;
        let found = data.match(re);
        if (found != null && found.length > 0) {
            let tmp = found[0].replace('<!--', '').replace('-->', '').replace('\r\n', '\n').trim();
            let lines = tmp.split('\n');
            
            let parsedLines = [];
            for(let line of lines) {
                let pair = line.split('=');
                let key = ''
                switch(pair.length) {
                    case 1: // no equal mark found
                        break;
                    case 2:
                        key = pair.shift().trim().toLowerCase();
                        key = ['"', key, '"'].join('');
                        pair.unshift(key);
                        line = pair.join(':')
                        break;
                    default://more than 2
                        key = pair.shift().trim().toLowerCase();
                        key = ['"', key, '"'].join('');
                        let value = pair.join('=');
                        line = [key, value].join(':');
                        break;
                }
                parsedLines.push(line)
            }

            return JSON.parse(['{', parsedLines.join(','), '}'].join(''));
        } else {
            return {
                title:'',
                date:'',
                categories:[]
            }
        }
    }
}
