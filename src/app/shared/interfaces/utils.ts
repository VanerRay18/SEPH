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
  oficio: string;
  nombre: string;
  fecha_primera_licencia: string;
  fecha_ultima_licencia: string;
  total_folios: number;
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
total_dias:any,
nueva:any,
accidente:any
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

