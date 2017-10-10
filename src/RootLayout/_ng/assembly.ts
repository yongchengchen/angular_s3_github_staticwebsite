import { Routes } from '@angular/router';

export const ROOTROUTES: Routes = [
    {
        path: '',
        loadChildren: 'RootLayout/layout/layout.module#LayoutModule'
    },
    { path: 'login', loadChildren: 'RootLayout/login/login.module#LoginModule' },
    { path: 'signup', loadChildren: 'RootLayout/signup/signup.module#SignupModule' }
];
