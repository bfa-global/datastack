import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { RootComponent } from './root.component';
import { RoutingModule } from './root-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StorageServiceModule } from 'angular-webstorage-service';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';

import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from './auth/auth.module';
import { MenuService } from './services/menu.service';
import { AuthService } from './auth/auth.service';
import { LoginRequiredGuardService } from './auth/guards/login-required.guard.service';
import { LoginProhibitedGuardService } from './auth/guards/login-prohibited.guard.service';

registerLocaleData(en);

@NgModule({
  declarations: [
    RootComponent,
  ],
  imports: [
    BrowserModule,
    RoutingModule,
    HttpClientModule,
    StorageServiceModule,
    NgZorroAntdModule,
    BrowserAnimationsModule,
    AuthModule
  ],
  providers: [
    AuthService,
    LoginRequiredGuardService,
    LoginProhibitedGuardService,
    MenuService,
    { provide: NZ_I18N, useValue: en_US }
  ],

  bootstrap: [RootComponent],
})
export class RootModule { }
