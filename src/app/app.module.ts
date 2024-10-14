import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './core/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { LicenciasModule } from './modules/pages/licencias/licencias.module';
import { NavComponent } from './shared/header/nav/nav.component';
import { LicenciasRoutingModule } from './modules/pages/licencias/licencias-routing.module';
import { HomeRoutingModule } from './modules/pages/home/home-routing.module';
import { PerfilComponent } from './modules/pages/extras/perfil/perfil.component';
import { ExtrasRoutingModule } from './modules/pages/extras/extras-routing.module';
import { LayoutModule } from './modules/layout/layout.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './core/interceptor/token.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AuthModule,
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    LicenciasModule,
    RouterModule,
    HttpClientModule,
    LicenciasRoutingModule,
    HomeRoutingModule,
    ExtrasRoutingModule,
    LayoutModule,
    NgbModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi:true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
