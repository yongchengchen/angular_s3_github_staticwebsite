import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MarkdownModule } from 'angular2-markdown';

import { RendererRoutingModule } from './renderer-routing.module';
import { RendererComponent } from './renderer.component';
import { AwsS3Service } from '../services/aws.s3.service'
import { BlogDataService } from '../services/blog.data.service'
import { AppLibsModule } from '@ngsuit';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        AppLibsModule,
        RendererRoutingModule,
        MarkdownModule.forRoot()
    ],
    exports: [],
    declarations: [RendererComponent],
    providers: [AwsS3Service, BlogDataService],
})
export class RendererModule { }
