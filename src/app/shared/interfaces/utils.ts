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