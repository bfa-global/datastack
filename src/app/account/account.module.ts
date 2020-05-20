import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from "./components/account/account.component"
import { DashboardComponentsModule } from '../dashboard/dashboard-components.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: AccountComponent },
]
@NgModule({
  declarations: [
    AccountComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardComponentsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
  ]
})
export class AccountModule { }
