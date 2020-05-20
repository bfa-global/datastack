import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardComponentsModule } from './dashboard-components.module';

const routes: Routes = [
  { path: '**', component: DashboardComponent }
]

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(routes),
    DashboardComponentsModule
  ],
  providers: [
  ]
})
export class DashboardModule { }
