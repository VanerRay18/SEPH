export interface Module {
  moduleId: number;          // Identificador del módulo
  parentId: number | null;   // Identificador del módulo padre (opcional)
  parentName: string | null;  // Nombre del módulo padre (opcional)
  config: string;            // Ruta de configuración del módulo
  description: string | null; // Descripción del módulo (opcional)
  moduleName: string;        // Nombre del módulo
  icon: string;
}

export interface Oficio {
  oficioId: number;
  oficio: string;
  nombre: string;
  fecha_primera_licencia: string;
  fecha_ultima_licencia: string;
  total_folios: number;
  apartir: string;
  status : string;
}


export interface Logs {
  usuario:string;
  nombre: string;
  accion:string;
  data:string;
  tiempo:any;
  prev:string;
  folio:string;
}

export interface LicMedica{
sep?: any;
sumaDias:any,
desde:any,
hasta:any,
fechaFisica: any,
total_days:any,
nueva:any,
formato: any,
apartir:any,
accidente:any,
observaciones: any,
fechaCaptura: any,
id: any,
color: any
}

export interface NominaA{
  id: any,
  retentionTotal: any;
  total:any,
  importeTotal:any,
  becarios:any,
  quincena: any,
  status:any
  }


export interface NominaP{
  retentionTotal: any,
  clabeBanco: any,
  srl_emp: any,
  liquidTotal: any,
  nombre: any,
  importTotal: any,
  clabe: any,
  curp: any
  }

// export interface clave{
//   CT: string;
//   PLAZA: string;
// }

// export interface licencia{
//   hasta: string;
//   desde: string;
//   periodo: number;
//   srl_emp: number;
//   nombre: string;
//   rfc: string;
//   foliolic: string;
//   oficio: string;
//   fechaCaptura: string;
//   observaciones: string;
//   apartir: string;
//   total_dias: number;
// }



export interface OficioPdf {
  data: {
    nombre: string;
    rfc: string;
    fecha_ingreso: string;
  };
  claves: Array<{
    PLAZA: string;
    CT: string;
  }>;
  licencias: Array<{
    foliolic: string;
    total_dias: string;
    desde: string;
    hasta: string;
    observaciones: string;
    apartir?: string;
    oficio: string;
  }>;
}

export interface historico {
  data: {
    nombre: string;
    rfc: string;
    fecha_ingreso: number;
  };
  licencias: Array<{
    hasta: string;
    desde: string;
    periodo: number;
    srl_emp: number;
    nombre: string;
    rfc: string;
    foliolic: string;
    oficio: number | null,
    fechaCaptura: string;
    observaciones: string;
    apartir: string |null;
    sumaDias: number;
    accidente: number;
    sep: number;
    total_dias: number;
  }>;
}

