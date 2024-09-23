import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { LicenciasModule } from './modules/pages/licencias/licencias.module';
import { InicioComponent } from './modules/pages/home/inicio/inicio.component';
import { PerfilComponent } from './modules/pages/extras/perfil/perfil.component';

const routes: Routes = [
  {
    path:'',
    pathMatch:'full',
    redirectTo:'/pages/home/'
  },
  {path: 'login',
    component: LoginComponent,
  },
  {path: 'Home',
    component: InicioComponent,
  },
  {
    path:'Licencias',
    loadChildren:() =>
      import('./modules/pages/licencias/licencias.module').then(
        (m) => m.LicenciasModule
      ),
  },
  {
    path:'Perfil',
    loadChildren:() =>
      import('./modules/pages/extras/perfil/perfil.component').then(
        (m) => m.PerfilComponent
      ),
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  
}
