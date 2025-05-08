
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
import { ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './modules/pages/administration/admin-routing.module';
import { AdministrationModule } from './modules/pages/administration/administration.module';
import { NominabecaRoutingModule } from './modules/pages/nomina-becarios/nominabeca-routing.module';
import { NominaBecariosModule } from './modules/pages/nomina-becarios/nomina-becarios.module';
import { TercerosRoutingModule } from './modules/pages/terceros/terceros-routing.module';
import { TercerosModule } from './modules/pages/terceros/terceros.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AdministrationModule,
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
    TercerosRoutingModule,
    TercerosModule,
    ExtrasRoutingModule,
    LayoutModule,
    NominabecaRoutingModule,
    NominaBecariosModule,
    ReactiveFormsModule,
    AdminRoutingModule
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
