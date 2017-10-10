import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// import { AwsS3Service } from '../services/aws.s3.service'
import { BlogDataService } from '../services/blog.data.service'
import { AWS_S3_LISTOBJECTS_CONTENT_ITEM } from '../services/aws.interfaces'

import { Subscription } from 'rxjs/Subscription';
import { MQService } from '@ngsuit';

@Component({
    selector: 'home-renderer',
    templateUrl: './renderer.component.html',
    styleUrls: ['./renderer.component.scss'],
})

export class RendererComponent implements OnInit, OnDestroy {
    private routeSub:Subscription
    private mqSub:Subscription
    private readonly pageSize:number = 5;
    currentCategory:string = 'home'
    currentPage:number=0;
    pages:number[] = [0];

    page_title:string = "Angular web site"
    page_subtitle:string = 'Angular web site'

    articles:AWS_S3_LISTOBJECTS_CONTENT_ITEM[] = []

    constructor(private route:ActivatedRoute, private title:Title, private blogdata:BlogDataService, private mq:MQService) {
        title.setTitle(this.page_title)
    }
   
    ngOnInit() {
        this.mqSub = this.mq.listen('RendererComponent').subscribe(msg => { 
            if (msg.type == 'listfetched') {
                let total =  Math.ceil(this.blogdata.getTotal(this.currentCategory) / this.pageSize);
                total = total > 0 ? total: 1;
                this.pages = Array(total).fill(0).map((x,i)=>i); // [0,1,2,3,4]
                this.pageTo(this.currentPage);
                this.page_title = this.blogdata.getSiteConfig().title;
                this.page_subtitle = this.blogdata.getSiteConfig().description;
                this.title.setTitle(this.page_title)
            }
         });

        this.routeSub = this.route.params.subscribe(params => {
            this.currentCategory = (params['category'] !== undefined ? params['category'] : 'home');
            this.blogdata.waitListFetched('RendererComponent');
        });

         this.blogdata.loadMenu()
        //  this.blogdata.waitListFetched('RendererComponent');
    }

    pageTo(page:number) {
        this.currentPage = page;
        this.articles = this.blogdata.getArticles(page, this.pageSize, this.currentCategory);

        let headerbarTitles = ['home'];
        if (this.currentCategory != 'home') {
            headerbarTitles.push(this.currentCategory);
        }

        this.mq.notify('headercompoment', {type:'title', data:headerbarTitles.join('/').toUpperCase()});
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.mqSub.unsubscribe();
    }
}