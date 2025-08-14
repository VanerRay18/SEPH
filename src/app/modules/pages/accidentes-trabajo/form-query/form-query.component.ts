import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-form-query',
  templateUrl: './form-query.component.html',
  styleUrls: ['./form-query.component.css']
})
export class FormQueryComponent  implements OnInit{

   accidentForm!: FormGroup;

  enfermedades = ['Enfermedad A', 'Enfermedad B', 'Enfermedad C'];
  agentes = ['Agente X', 'Agente Y', 'Agente Z'];
  aparatos = ['Sistema Nervioso', 'Sistema Digestivo', 'Sistema Respiratorio'];
  diasLicencia = [1, 3, 5, 7, 14, 30];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.accidentForm = this.fb.group({
      rfc: [''],
      nombreCompleto: [''],
      fechaHoraAccidente: [''],
      clavePresupuestal: [''],
      cct: [''],
      enfermedad: [''],
      genero: [''],
      agente: [''],
      aparato: [''],
      diasLicencia: ['']
    });
  }

  onSubmit() {
    console.log('Formulario enviado:', this.accidentForm.value);
  }

}
