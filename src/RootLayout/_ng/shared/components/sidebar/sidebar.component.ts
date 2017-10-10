import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { MENUS_DEFINES } from '@appassemble';
import { MenuProvider, MENUITEM } from './menu.provider';
import { MQService } from '@ngsuit';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit, OnDestroy {
    isActive = false;
    showMenu = '';
    menus;
    selected:string = '';
    private mqSub:Subscription

    constructor(private http: Http, private mq:MQService) {
        this.menus = MenuProvider.parseMenus(MENUS_DEFINES);
    }

    ngOnInit() {
        this.mqSub = this.mq.listen('SidebarComponent').subscribe(msg => {
            if (msg.type == 'updatemenu') {
                this.menus = msg.data;
            }
        });
    }

    ngOnDestroy() {
        this.mqSub.unsubscribe();
    }

    // readJson = (): Observable<Response> => {
    //     return this.http.get('/assets/sidebar.menus.json').map(res => res.json());
    // }

    // expendMenu(menu) {
    //     this.menus.push(menu);
    // }


    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }
}
