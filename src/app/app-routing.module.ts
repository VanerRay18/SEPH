import { AccidentesTrabajoModule } from './modules/pages/accidentes-trabajo/accidentes-trabajo.module';
import { TercerosModule } from './modules/pages/terceros/terceros.module';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/layout.component';
import { LoginComponent } from './core/auth/login/login.component';
import { IngresoLicenciasComponent } from './modules/pages/licencias/ingreso-licencias/ingreso-licencias.component';
import { LoggedGuard } from './core/guards/logged.guard';
import { UsersComponent } from './modules/pages/administration/users/users.component';
import { HomeModule } from './modules/pages/home/home.module';
import { AdministrationModule } from './modules/pages/administration/administration.module';
import { UserCRUDComponent } from './modules/pages/administration/user-crud/user-crud.component';
import { RolesCRUDComponent } from './modules/pages/administration/roles-crud/roles-crud.component';
import { ModulesCRUDComponent } from './modules/pages/administration/modules-crud/modules-crud.component';
import { EndopointCRUDComponent } from './modules/pages/administration/endopoint-crud/endopoint-crud.component';
import { TestComponent } from './modules/pages/extras/test/test.component';
import { NominaBecariosModule } from './modules/pages/nomina-becarios/nomina-becarios.module';
import { FormRecordComponent } from './modules/pages/accidentes-trabajo/form-record/form-record.component';
import { RegistroComponent } from './modules/pages/accidentes-trabajo/registro/registro.component';
import { FormQueryComponent } from './modules/pages/accidentes-trabajo/form-query/form-query.component';
import { RequestComponent } from './modules/pages/accidentes-trabajo/request/request.component';
import { PruebasComponent } from './modules/pages/extras/pruebas/pruebas.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'Test', component: PruebasComponent },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'Accidentes-Trabajo', component: RegistroComponent },
  {
    path: 'pages',
    component: LayoutComponent,
    canActivate: [LoggedGuard],
    children: [

      {
        path: 'Licencias',
        loadChildren: () =>
          import('./modules/pages/licencias/licencias.module').then(
            (m) => m.LicenciasModule
          ),
      },
      {
        path: 'Extras',
        loadChildren: () =>
          import('./modules/pages/extras/extras.module').then(
            (m) => m.ExtrasModule
          ),
      },
      {
        path: 'Inicio',
        loadChildren: () =>
          import('./modules/pages/home/home.module').then(
            (m) => m.HomeModule
          ),
      },
      {
        path: 'Admin',
        loadChildren: () =>
          import('./modules/pages/administration/administration.module').then(
            (m) => m.AdministrationModule
          ),
      },
      {
        path: 'NominaBecarios',
        loadChildren: () =>
          import('./modules/pages/nomina-becarios/nomina-becarios.module').then(
            (m) => m.NominaBecariosModule
          ),
      },
      {
        path: 'Terceros',
        loadChildren: () =>
          import('./modules/pages/terceros/terceros.module').then(
            (m) => m.TercerosModule
          ),
      },
      {
        path: 'AccidentesTrabajo',
        loadChildren: () =>
          import('./modules/pages/accidentes-trabajo/accidentes-trabajo.module').then(
            (m) => m.AccidentesTrabajoModule
          ),
      }
    ],
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


}
