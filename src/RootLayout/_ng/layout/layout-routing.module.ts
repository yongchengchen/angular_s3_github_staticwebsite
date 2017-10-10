import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { CHILDROUTES_DEFINES } from '@appassemble';

@NgModule({
    imports: CHILDROUTES_DEFINES,
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
