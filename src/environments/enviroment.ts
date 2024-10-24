type AppEnvironment = {
    baseService: string;
    logoutTime: number;
    authUrl: string;
  };
  export const environment: AppEnvironment = {
  baseService: 'http://localhost:8080',
    //baseService: 'http://10.10.10.208:8080',
    logoutTime: 10680000,
    authUrl: 'https://www.google.com'
  };
