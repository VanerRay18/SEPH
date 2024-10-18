type AppEnvironment = {
    baseService: string;
    logoutTime: number;
    authUrl: string;
  };
  export const environment: AppEnvironment = {
   //baseService: 'http://localhost:8080',
    baseService: 'https://d932w4j4-8080.usw3.devtunnels.ms',
    logoutTime: 10680000,
    authUrl: 'https://www.google.com'
  };
