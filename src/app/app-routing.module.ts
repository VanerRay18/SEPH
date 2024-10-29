import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/layout.component';
import { LoginComponent } from './core/auth/login/login.component';
import { IngresoLicenciasComponent } from './modules/pages/licencias/ingreso-licencias/ingreso-licencias.component';
import { LoggedGuard } from './core/guards/logged.guard';
import { UsersComponent } from './modules/pages/administration/users/users.component';
import { HomeModule } from './modules/pages/home/home.module';
import { AdministrationModule } from './modules/pages/administration/administration.module';



const routes: Routes = [
  {path:'',redirectTo:'/login',pathMatch:'full'},
  { path: 'Test', component: UsersComponent },
  {path: 'login',
    component: LoginComponent,
  },
  {
    path: 'pages',
    component: LayoutComponent,
    canActivate: [LoggedGuard],
    children: [
      {
        path: 'Inicio',
        loadChildren: () =>
          import('./modules/pages/home/home.module').then((m) => m.HomeModule),
      },
      {
        path:'Licencias',
        loadChildren:() =>
          import('./modules/pages/licencias/licencias.module').then(
            (m) => m.LicenciasModule
          ),
      },
      {
        path:'Extras',
        loadChildren:() =>
          import('./modules/pages/extras/extras.module').then(
            (m) => m.ExtrasModule
          ),
      },
      {
        path:'**',
        loadChildren:() =>
          import('./modules/pages/home/home.module').then(
            (m) => m.HomeModule
          ),
      },
      {
        path:'Admin',
        loadChildren:() =>
          import('./modules/pages/administration/administration.module').then(
            (m) => m.AdministrationModule
          ),
      }
    ],
    },
     {path:'**',redirectTo:'/login',pathMatch:'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


}
