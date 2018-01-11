import { Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { LayoutComponent } from 'RootLayout/layout/layout.component';

export const CHILDROUTES: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            {
                path: "home", 
                loadChildren: "Blog/home/renderer.module#RendererModule"
            },
            {
                path: "category/:category", 
                loadChildren: "Blog/home/renderer.module#RendererModule"
            },
            {
                path: "article/:name", 
                loadChildren: "Blog/article/article.module#ArticleModule"
            },
            {
                path: "article/:category/:name", 
                loadChildren: "Blog/article/article.module#ArticleModule"
            }
        ]
    }
];

export const MENUS = [
    {sort:0, item:{name:"home", link:"/home", image:"/assets/images/home.png", title:"Home"}}
];
    // {sort:0, item:{name:"me", link:"/article/aboutme.md", image:"/assets/images/aboutme.png", title:"Me"}}

// export const MENUS = [
//     {sort:0, name:"home", item:{ link:"/home", image:"/assets/images/home.png", title:"Home"}},
//     {sort:10, name:"angular", item:{ link:"/angular", image:"favicon.ico", title:"Angular"}},
//     {sort:11, name:"event", parent:"angular", item:{link:"/angular/event", icon:"fa-6 fa-usd", title:"Event" }},

//     {sort:20, name:"laravel", item:{ link:"/laravel", image:"/assets/images/laravel.png", title:"Laravel"}},
//     {sort:30, name:"magento", item:{ link:"/magento", image:"/assets/images/magento.png", title:"Magento"}},
// ];

export const PROVIDERS = [HttpClient]
