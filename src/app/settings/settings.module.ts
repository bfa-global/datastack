import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { DashboardComponentsModule } from '../dashboard/dashboard-components.module';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { GlobalSettingsComponent } from './components/global-settings/global-settings.component';

const routes: Routes = [
  { path: '', component: SettingsComponent },
]
@NgModule({
  declarations: [
    SettingsComponent,
    UserListComponent,
    DepartmentListComponent,
    RoleListComponent,
    GlobalSettingsComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    DashboardComponentsModule,
    NgZorroAntdModule
  ]
})
export class SettingsModule { }
