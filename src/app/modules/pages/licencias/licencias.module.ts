import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { CommonModule } from '@angular/common';
import { LicenciasRoutingModule } from './licencias-routing.module';
import { IngresoLicenciasComponent } from './ingreso-licencias/ingreso-licencias.component';
import { ArchivoLicenciasComponent } from './archivo-licencias/archivo-licencias.component';
import { OficioLicenciasComponent } from './oficio-licencias/oficio-licencias.component';
import { SharedModule } from "../../../shared/shared.module";
import { IngresoAccidentesComponent } from './ingreso-accidentes/ingreso-accidentes.component';
import { AcuerdosPreciComponent } from './acuerdos-preci/acuerdos-preci.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    IngresoLicenciasComponent,
    ArchivoLicenciasComponent,
    OficioLicenciasComponent,
    IngresoAccidentesComponent,
    AcuerdosPreciComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Añadir FormsModule a los imports
    HttpClientModule,
    LicenciasRoutingModule,
    SharedModule,
    ReactiveFormsModule
]
})
export class LicenciasModule { }
