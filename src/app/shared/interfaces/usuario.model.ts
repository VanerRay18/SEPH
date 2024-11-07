export interface User {
    username: string;
    password: string;
    roles: number[];  // Roles del usuario
    modules: number[];  // Módulos a los que el usuario tiene acceso
  }

  export interface Employee {
    rfc: string;
    nombre: string;
    srl_emp: number;
    fecha_ingreso: number;
  }
