import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ShellComponent } from './shell/shell.component'
import { ShellModule } from './shell/shell.module';
import { AdminRequiredGuardService } from './auth/guards/admin-required.guard.service';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {
    path: '', component: ShellComponent, children: [
      { path: '', component: HomeComponent },
      { path: 'map', loadChildren: "./maps/maps.module#MapsModule" },
      { path: 'dashboard', loadChildren: "./dashboard/dashboard.module#DashboardModule" },
      { path: 'account', loadChildren: "./account/account.module#AccountModule" },
      { path: 'settings', canLoad: [AdminRequiredGuardService], canActivate: [AdminRequiredGuardService], loadChildren: "./settings/settings.module#SettingsModule" },
    ]
  },
]

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ShellModule,
  ],
})
export class AppModule { }
