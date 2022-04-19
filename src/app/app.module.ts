import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CoreModule} from "@core/core.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LocalStorageService} from "@shared/services/local-storage.service";
import {NavModule} from "@components/nav/nav.module";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    NavModule
  ],
  providers: [
    LocalStorageService
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
