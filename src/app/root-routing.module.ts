import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { LoginProhibitedGuardService } from './auth/guards/login-prohibited.guard.service';
import { LoginRequiredGuardService } from './auth/guards/login-required.guard.service';
import { QueryParamsService } from './query-params.service';


const routes: Routes = [
  { path: '', canActivate: [LoginProhibitedGuardService, QueryParamsService], loadChildren: "./landing/landing.module#LandingModule" },
  { path: 'login', canLoad: [LoginProhibitedGuardService], canActivate: [LoginProhibitedGuardService, QueryParamsService], loadChildren: "./auth/auth.module#AuthModule" },
  { path: 'app', canLoad: [LoginRequiredGuardService], canActivate: [LoginRequiredGuardService, QueryParamsService], loadChildren: "./app.module#AppModule" },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ],
  providers: [
  ],
  declarations: []
})

export class RoutingModule { };
