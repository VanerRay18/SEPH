import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { CommonModule } from '@angular/common';
import { LicenciasRoutingModule } from './licencias-routing.module';
import { IngresoLicenciasComponent } from './ingreso-licencias/ingreso-licencias.component';
import { ArchivoLicenciasComponent } from './archivo-licencias/archivo-licencias.component';
import { OficioLicenciasComponent } from './oficio-licencias/oficio-licencias.component';
import { SharedModule } from "../../../shared/shared.module";



@NgModule({
  declarations: [
    IngresoLicenciasComponent,
    ArchivoLicenciasComponent,
    OficioLicenciasComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Añadir FormsModule a los imports
    HttpClientModule,
    LicenciasRoutingModule,
    SharedModule
]
})
export class LicenciasModule { }
