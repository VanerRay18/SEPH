import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ModulesComponent } from './modules/modules.component';
import { EndpointComponent } from './endpoint/endpoint.component';
import { HomeAdminComponent } from './home-admin/home-admin.component';

const routes: Routes = [
  {path: 'Users',component:UsersComponent},
  {path: 'Roles',component:RolesComponent},
  {path: 'Modulos',component:ModulesComponent},
  {path: 'EndPoint',component:EndpointComponent},
  {path: 'Home-Admin',component:HomeAdminComponent}
  ];




@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)], // Configura las rutas a nivel de raíz
  exports: [RouterModule]
})
export class AdminRoutingModule { }
