import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MarkdownModule } from 'angular2-markdown';

import { ArticleRoutingModule } from './article-routing.module';
import { ArticleComponent } from './article.component';

import { AwsS3Service } from '../services/aws.s3.service'
import { BlogDataService } from '../services/blog.data.service'

@NgModule({
    imports: [
        CommonModule,
        ArticleRoutingModule,
        HttpClientModule,
        MarkdownModule.forRoot()
    ],
    exports: [],
    declarations: [ArticleComponent],
    providers: [AwsS3Service, BlogDataService],
})

export class ArticleModule { }
