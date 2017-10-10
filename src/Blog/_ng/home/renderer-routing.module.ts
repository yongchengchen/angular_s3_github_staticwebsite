import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RendererComponent } from './renderer.component';

const routes: Routes = [
    {
        path:'', component: RendererComponent,
        children: [
            ]
        }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RendererRoutingModule { }
