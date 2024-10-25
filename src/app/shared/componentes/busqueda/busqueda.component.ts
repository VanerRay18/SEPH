import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Employee } from '../../interfaces/usuario.model';
import { LicMedica } from '../../interfaces/utils';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent {
  data = [];
  showCard: boolean = false;
  table: any = true;

  rfcSearchTerm: string = '';
  nombreSearchTerm: string = '';
  rfcFavorSearchTerm: string = ''; // Nuevo término de búsqueda para RFC de favor

  items: { rfc: string; nombre: string; srl_emp: number }[] = [];
  rfcSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];
  nombreSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];
  rfcFavorSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = []; // Sugerencias para RFC de favor

  private rfcSearchSubject: Subject<string> = new Subject<string>();
  private nombreSearchSubject: Subject<string> = new Subject<string>();
  private rfcFavorSearchSubject: Subject<string> = new Subject<string>(); // Subject para RFC de favor

  @Output() srl_emp: EventEmitter<any> = new EventEmitter();

  constructor( 
    private LicenciasService: LicenciasService,
    private BusquedaserlService: BusquedaserlService,
    public PermisosUserService: PermisosUserService
  ) {
    // Configurar debounce para el término de búsqueda de RFC
    this.rfcSearchSubject.pipe(debounceTime(300)).subscribe(searchTerm => this.performRFCSearch(searchTerm));
    
    // Configurar debounce para el término de búsqueda de Nombre
    this.nombreSearchSubject.pipe(debounceTime(300)).subscribe(searchTerm => this.performNombreSearch(searchTerm));

    // Configurar debounce para el término de búsqueda de RFC de favor
    this.rfcFavorSearchSubject.pipe(debounceTime(300)).subscribe(searchTerm => this.performRFCFavorSearch(searchTerm));
  }

  ngOnInit() {
    this.BusquedaserlService.srlEmp$.subscribe(value => {
    
      if (value != null) {
        this.rfcSearchTerm = value.rfc;
        this.nombreSearchTerm = value.nombre;
      }
    });

    this.LicenciasService.getUsers().subscribe((response: { data: Employee[] }) => {
      this.items = response.data.map((user: Employee) => ({
        rfc: user.rfc,
        nombre: user.nombre,
        srl_emp: user.srl_emp
      }));
    });
  }

  clean() {
    this.rfcSearchTerm = '';
    this.nombreSearchTerm = '';
    this.rfcFavorSearchTerm = ''; // Limpiar RFC de favor
    this.BusquedaserlService.clearSrlEmp();
  }

  // Filtrar RFC al escribir
  filterRFC() {
    this.rfcSearchSubject.next(this.rfcSearchTerm);
  }

  // Filtrar Nombre al escribir
  filterNombre() {
    this.nombreSearchSubject.next(this.nombreSearchTerm);
  }

  // Filtrar RFC de favor al escribir
  filterRFCFavor() {
    this.rfcFavorSearchSubject.next(this.rfcFavorSearchTerm);
  }

  private performRFCSearch(searchTerm: string) {
    if (searchTerm.length >= 3) { // Cambia de 5 a 3 caracteres
      this.rfcSuggestions = this.items.filter(item =>
        item.rfc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.rfcSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
    }
    this.nombreSuggestions = [];
  }
  

  private performNombreSearch(searchTerm: string) {
    // Divide el término de búsqueda en palabras
    
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

    if (searchTerms.length > 0) { // Verifica que haya al menos un término de búsqueda
        this.nombreSuggestions = this.items.filter(item => {
          
            const nombreCompleto = item.nombre.toLowerCase();
            // Verifica que cada término de búsqueda esté en el nombre completo
            return searchTerms.every(term => nombreCompleto.includes(term));
        });
    } else {
        this.nombreSuggestions = []; // Limpia las sugerencias si no hay términos de búsqueda válidos
    }

    this.rfcSuggestions = [];
}

  private performRFCFavorSearch(searchTerm: string) {
    if (searchTerm.length >= 3) { // Verificar si hay al menos 5 caracteres
      this.rfcFavorSuggestions = this.items.filter(item =>
        item.rfc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.rfcFavorSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
    }
  }

  selectRFC(item: { rfc: string; nombre: string; srl_emp: number }) {
    this.rfcSearchTerm = item.rfc;
    this.nombreSearchTerm = item.nombre;
    this.rfcSuggestions = [];
    this.nombreSuggestions = [];
    this.srl_emp.emit(item.srl_emp);
    
    const valores = {
      srl_emp: item.srl_emp,
      rfc: item.rfc,
      nombre: item.nombre,
      mostrar: true
    };
    
    this.BusquedaserlService.updateSrlEmp(valores);
  }

  // Seleccionar un Nombre y completar el RFC
  selectNombre(item: { rfc: string; nombre: string; srl_emp: number }) {
    this.nombreSearchTerm = item.nombre;
    this.rfcSearchTerm = item.rfc;
    this.srl_emp.emit(item.srl_emp);
    
    const valores = {
      srl_emp: item.srl_emp,
      rfc: item.rfc,
      nombre: item.nombre,
      mostrar: true
    };

    this.BusquedaserlService.updateSrlEmp(valores);

    this.rfcSuggestions = [];
    this.nombreSuggestions = [];
  }
}



































// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
// import { Employee } from '../../interfaces/usuario.model';
// import { LicMedica } from '../../interfaces/utils';
// import { ApiResponse } from 'src/app/models/ApiResponse';
// import { NgModule } from '@angular/core';
// import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
// import { PermisosUserService } from 'src/app/services/permisos-user.service';
// @Component({
//   selector: 'app-busqueda',
//   templateUrl: './busqueda.component.html',
//   styleUrls: ['./busqueda.component.css']
// })
// export class BusquedaComponent {
//   data = [];
//   showCard: boolean = false;
//   table:any = true;

//   rfcSearchTerm: string = '';
//   nombreSearchTerm: string = '';

//   items: { rfc: string; nombre: string; srl_emp: number }[] = [];
//   rfcSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];
//   nombreSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];

//   @Output() srl_emp: EventEmitter<any> = new EventEmitter();
//   constructor( 
//     private LicenciasService: LicenciasService,
//     private BusquedaserlService: BusquedaserlService,
//     public PermisosUserService :PermisosUserService
//   ){}


//   ngOnInit() {
    

//     this.BusquedaserlService.srlEmp$.subscribe(value => {
//       console.log(value)
//       if(value != null){
//       this.rfcSearchTerm= value.rfc
//       this.nombreSearchTerm= value.nombre
//       }
//     });
//     this.LicenciasService.getUsers().subscribe((response: { data: Employee[] }) => {
//       this.items = response.data.map((user: Employee) => ({
//         rfc: user.rfc,
//         nombre: user.nombre,
//         srl_emp: user.srl_emp
//       }));
//     });
    
//   }

//   clean(){
//     this.rfcSearchTerm= ''
//     this.nombreSearchTerm= ''
//     this.BusquedaserlService.clearSrlEmp()
    
//   }

//     // Filtrar RFC al escribir
//     filterRFC() {
//       if (this.rfcSearchTerm.length >= 5) { // Verificar si hay al menos 3 caracteres
//         this.rfcSuggestions = this.items.filter(item =>
//           item.rfc.toLowerCase().includes(this.rfcSearchTerm.toLowerCase())
//         );
//       } else {
//         this.rfcSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
//       }
//       this.nombreSuggestions = [];
//     }
  
//     // Filtrar Nombre al escribir
//     filterNombre() {
//       if (this.nombreSearchTerm.length >= 4) { // Verificar si hay al menos 4 caracteres
//         this.nombreSuggestions = this.items.filter(item =>
//           item.nombre.toLowerCase().includes(this.nombreSearchTerm.toLowerCase())
//         );
//       } else {
//         this.nombreSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
//       }
//       this.rfcSuggestions = [];
//     }

//     selectRFC(item: { rfc: string; nombre: string; srl_emp: number }) {
//       this.rfcSearchTerm = item.rfc;
//       this.nombreSearchTerm = item.nombre;
//       this.rfcSuggestions = [];
//       this.nombreSuggestions = [];
//       this.srl_emp.emit(item.srl_emp)
//       const valores={
//         srl_emp:item.srl_emp,
//         rfc:item.rfc,
//         nombre:item.nombre,
//         mostrar:true
//       }
      
//       this.BusquedaserlService.updateSrlEmp(valores)
//     }
  
//     // Seleccionar un Nombre y completar el RFC
//     selectNombre(item: { rfc: string; nombre: string; srl_emp: number }) {
//       this.nombreSearchTerm = item.nombre;
//       this.rfcSearchTerm = item.rfc;
//       this.srl_emp.emit(item.srl_emp)
//       const valores={
//         srl_emp:item.srl_emp,
//         rfc:item.rfc,
//         nombre:item.nombre,
//         mostrar:true
//       }

//       this.BusquedaserlService.updateSrlEmp(valores)
  
//       this.rfcSuggestions = [];
//       this.nombreSuggestions = [];
//     }

//     buscar(srl_emp: any) {
//       this.showCard = true;
//       this.srl_emp = srl_emp;
//       console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm, 'y srl_emp:', this.srl_emp);
  
//       this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
//         this.table = true
//         this.data = response.data.map((item: LicMedica) => ({
//           ...item,
//           rango_fechas: `${item.total_dias} -   ${item.accidente == 1? '':item.sumaDias}`
//         })); // Aquí concatenas las fechas
  
//       },
//       (error) => {
//         this.table = false; // Asegúrate de manejar el estado de la tabla en caso de error
//         console.error('Error al obtener los accidentes: ', error); // Manejo del error
//       }
//       );
//     }
// }

