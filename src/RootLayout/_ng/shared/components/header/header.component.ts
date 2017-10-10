import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MQService } from '@ngsuit';
import { Subscription } from 'rxjs/Subscription';

interface NOTIFY_MSG {
    brief:string,
    detail:string
    time?:number,
}


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers:[]
})
export class HeaderComponent implements OnInit, OnDestroy {
    title:string = '';
    subscription:Subscription;
    @ViewChild('layoutheaderbar', { read: ViewContainerRef }) _headerbar;
    notifies:[NOTIFY_MSG];

    constructor(private translate: TranslateService, public router: Router, private mq:MQService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992) {
                this.toggleSidebar();
            }
        });
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('push-right');
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    ngOnInit() {
        if (localStorage.getItem('PRIVATE_NOTIFIES')) {
            this.notifies = JSON.parse(localStorage.getItem('PRIVATE_NOTIFIES'));
        } else {
            this.notifies = [{
                brief:'No Message',
                time:Date.now(),
                detail:''
            }];
        }

        this.subscription = this.mq.listen('headercompoment').subscribe(msg => { 
            switch(msg.type) {
                case 'title':
                console.log('get title', msg)
                    this.title = msg.data;
                    break;
                case 'headerbar':
                    this._headerbar.remove(0);
                    if (msg.data) {
                        this._headerbar.createEmbeddedView(msg.data);
                    }
                    break;
                case 'notify':
                    this.handlePrivteNotify(<NOTIFY_MSG>msg.data);
                    break;
            }
        });

        
    }

    private handlePrivteNotify(notify:NOTIFY_MSG) {
        notify.time = Date.now();
        this.notifies.unshift(notify);
        if (this.notifies) {
            while(this.notifies.length>20) {
               this.notifies.pop();
            }
            localStorage.setItem('PRIVATE_NOTIFIES', JSON.stringify(this.notifies));
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
