import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AWS_CONFIG } from './aws.config'

import { AwsS3Service } from './aws.s3.service'
import { AWS_S3_LISTOBJECTS_RESPONSE, AWS_S3_LISTOBJECTS_CONTENT_ITEM, AWS_S3_GETOBJECT_RESPONSE } from '../services/aws.interfaces'
import { MENUITEM, MenuProvider } from 'RootLayout/shared/components'

import { MENUS_DEFINES } from '@appassemble';
import { MQService } from '@ngsuit';

interface GITHUB_JSON {
    name: string;
    title: string;
    description: string;
    email: string;
    author: string;
    posts: Post[];
}
  
interface Post {
    categories: string[];
    description?: string;
    tags?: string[];
    date: string;
    title: string;
    url: string;
    menu?: string;
}

interface ARTICLE_BY_CATEGORY_DIC {
    [key: string]:AWS_S3_LISTOBJECTS_CONTENT_ITEM[]
}

@Injectable()
export class BlogDataService {
    private menus:any;
    private articles:AWS_S3_LISTOBJECTS_CONTENT_ITEM[] = [];
    private articles_by_category: ARTICLE_BY_CATEGORY_DIC = {};
    private listFetchedEventListeners:string[] = [];
    private bIsListFetched:boolean = false;

    private siteconfig:GITHUB_JSON;

    s3ObjectList: AWS_S3_LISTOBJECTS_RESPONSE

    constructor(private s3service:AwsS3Service, private mq:MQService, private http: HttpClient) {
        this.fetchList();
    }

    private fetchList() {
        // this.s3service.getObject('list.json', (err, data)=>{
        //     this.s3ObjectList = <AWS_S3_LISTOBJECTS_RESPONSE>JSON.parse((<AWS_S3_GETOBJECT_RESPONSE>data).Body.toString());
        //     this.sortByDate('desc');
        //     this.menus = MenuProvider.parseMenus(MENUS_DEFINES, this.prepareMenus());
        //     this.loadMenu();
        //     this.prepareArticles();
        //     this.broadcastFetched();
        // });
        this.fetchListGithub();
    }

    public getSiteConfig():GITHUB_JSON {
        return this.siteconfig;
    }

    private fetchListGithub() {
        let date = new Date();
        this.http.get('/assets/articles.json?' + date.getTime()).subscribe(value=> {
            this.siteconfig = <GITHUB_JSON>value
            this.s3ObjectList = this.github2S3List(this.siteconfig)
            this.sortByDate('desc');
            this.menus = MenuProvider.parseMenus(MENUS_DEFINES, this.prepareMenus());
            this.loadMenu();
            this.prepareArticles();
            this.broadcastFetched();
        });
    }

    private github2S3List(json:GITHUB_JSON) {
        let s3list:AWS_S3_LISTOBJECTS_RESPONSE = {
            IsTruncated:true,
            CommonPrefixes:[],
            Contents:[],
            Name:'',
            MaxKeys:10,
            KeyCount:1000
        };
        for(let post of json.posts) {
            let key = post.url.substr(post.url.indexOf('/master/content/')).substr(16);
            let item:AWS_S3_LISTOBJECTS_CONTENT_ITEM = {
                Key:key,
                LastModified:post.date,
                ETag:'',
                Size:20,
                StorageClass:'',
                ng_url:key,
                res_url:post.url,
                categories:post.categories,
                title:post.title
            }
            s3list.Contents.push(item);
        }
        return s3list;
    }

    private prepareMenus() {
        let menus:any[] = [];
        let parsed_menu_keys = {}
        let sort:number = 100;
        for(let item of this.s3ObjectList.Contents) {
            let paths =  item.Key.split('/');
            //first level
            if (paths.length == 1) {
                //is file
                if (item.Size > 0) {
                    continue;
                }
            }
            if (paths[0] == 'assets') {
                continue;
            }
            let parent:string;
            let tempKey:string = '';
            for(let idx in paths) {
                let path = paths[idx];
                tempKey += path;
                sort++;
                if (parsed_menu_keys[tempKey] === undefined && path != '') {
                    let isLastPart:boolean = (+idx+1 == paths.length);
                    let menu = {
                        sort: sort + (path.toLowerCase() == 'others' ? 1000:0),
                        parent:parent,
                        name:tempKey,
                        item:{
                            link: (isLastPart ? '/article/' : '/category/') + tempKey,
                            image:'/assets/images/' + path + '.png',
                            title: (isLastPart && item.title) ? item.title:path,
                            submenu:[],
                            items:[]
                        }
                    }
                    menus.push(menu);
                }
                parent = tempKey
                parsed_menu_keys[tempKey] = 1;
                tempKey += '/'
            }
        }
        return menus;
    }

    private prepareArticles() {
        for(let item of this.s3ObjectList.Contents) {
            let paths =  item.Key.split('/');
            //first level
            if (paths.length == 1) {
                continue;
            }
            if (paths[0] == 'assets') {
                continue;
            }

            item.title = item.title ? item.title : paths.pop();
            item.categories = paths;
            if (!item.res_url) {
                console.log('res_url')
                item.res_url = [AWS_CONFIG.s3_statichost_url, item.Key].join('/')
            }
            // item.res_url = [AWS_CONFIG.s3_statichost_url, item.Key].join('/')
            item.ng_url = ['/article', item.Key].join('/')

            if (item.Size > 0) {
                let category = paths[0].toLowerCase()
                if (this.articles_by_category[category] === undefined) {
                    this.articles_by_category[category] = [];
                }
                this.articles_by_category[category].push(item);
                this.articles.push(item);
            }
        }
    }

    public sortByDate(sort?:string) {
        let bSort = (sort != 'desc');
        this.s3ObjectList.Contents.sort((a: AWS_S3_LISTOBJECTS_CONTENT_ITEM, b: AWS_S3_LISTOBJECTS_CONTENT_ITEM) => {
            if (a.LastModified < b.LastModified) {
              return bSort ? -1 : 1;
            } else if (a.LastModified > b.LastModified) {
              return bSort ? 1 : -1;
            } else {
              return 0;
            }
        });
    }

    public getArticles(page:number, pageSize:number, category:string) {
        let articles = [];
        let collection = this.getArticleCollectionByCategory(category);
        for (let i:number = page * pageSize;
             i<collection.length; 
             i++) {
            articles.push(collection[i]);
            if (articles.length >= pageSize) {
                break;
            }
        }
        return articles;
    }

    private getArticleCollectionByCategory(category:string) {
        let collection = category == 'home' ? this.articles : this.articles_by_category[category.toLowerCase()];
        return collection === undefined ? [] : collection;
    }

    public getTotal(category:string) {
        let collection = this.getArticleCollectionByCategory(category);
        return collection.length;     
    }
    
    public loadMenu() {
        if (this.menus != undefined) {
            this.mq.notify('SidebarComponent', {type:'updatemenu', data:this.menus})
        }
    }

    public waitListFetched(listener:string) {
        if (this.bIsListFetched) {
            this.mq.notify(listener, {type:'listfetched', data:this.s3ObjectList})
        } else {
            this.listFetchedEventListeners.push(listener);
        }
    }

    private broadcastFetched() {
        this.bIsListFetched = true;
        
        for(let listener of this.listFetchedEventListeners) {
            this.mq.notify(listener, {type:'listfetched', data:this.s3ObjectList})
        }
    }
}