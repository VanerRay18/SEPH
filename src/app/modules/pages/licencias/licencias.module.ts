import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { CommonModule } from '@angular/common';
import { LicenciasRoutingModule } from './licencias-routing.module';
import { IngresarLicenciaComponent } from './ingresar-licencia/ingresar-licencia.component';
import { HistorialLicenciasComponent } from './historial-licencias/historial-licencias.component';
import { HistorialComponent } from './historial/historial.component';
import { BuscarLicenciasComponent } from './buscar-licencias/buscar-licencias.component';



@NgModule({
  declarations: [
    IngresarLicenciaComponent,
    HistorialLicenciasComponent,
    HistorialComponent,
    BuscarLicenciasComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Añadir FormsModule a los imports
    HttpClientModule,
    LicenciasRoutingModule
  ]
})
export class LicenciasModule { }
