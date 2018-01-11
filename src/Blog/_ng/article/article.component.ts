import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogDataService } from '../services/blog.data.service'
import { AWS_S3_LISTOBJECTS_RESPONSE } from '../services/aws.interfaces'

import { AWS_CONFIG } from '../services/aws.config'
import { MQService } from '@ngsuit';

@Component({
    selector: 'blog-article',
    templateUrl: 'article.component.html'
})

export class ArticleComponent implements OnInit, OnDestroy {
    private routeSub: any;
    private mqSub: any;
    private composeKey:string;

    private s3list:AWS_S3_LISTOBJECTS_RESPONSE;

    public markdown_file:string;

    constructor(private route: ActivatedRoute, private blogdata:BlogDataService, private mq:MQService, private title:Title) { }

    ngOnInit() {
        this.blogdata.loadMenu()
        this.routeSub = this.route.params.subscribe(params => {
            // this.composeKey = [AWS_CONFIG.s3_statichost_url, params['category'], params['name']].join('/')
            let keys = [params['name']];
            if (params['category']) {
                keys.unshift(params['category']);
            }
            this.composeKey = keys.join('/')
            this.findArticle(this.composeKey)
        });
        
         this.mqSub = this.mq.listen('ArticleComponent').subscribe(msg => { 
            if (msg.type == 'listfetched') {
                this.s3list = <AWS_S3_LISTOBJECTS_RESPONSE>msg.data;
                this.findArticle(this.composeKey)
                this.title.setTitle(this.blogdata.getSiteConfig().title)
            }
         });

        this.blogdata.waitListFetched('ArticleComponent')
    }

    private findArticle(key:string) {
        if (this.s3list && this.s3list.Contents) {
            for(let item of this.s3list.Contents) {
                if (item.Key == this.composeKey) {
                    this.markdown_file = item.res_url;
                    this.mq.notify('headercompoment', {type:'title', data:item.title});
                    this.title.setTitle(this.blogdata.getSiteConfig().title + '  - ' + item.title)
                    break;
                }
            }
        }
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.mqSub.unsubscribe();
    }
}
