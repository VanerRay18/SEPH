type AppEnvironment = {
    baseService: string;
    logoutTime: number;
    authUrl: string;
  };
  export const environment: AppEnvironment = {
    baseService: 'http://localhost:8080/',
    logoutTime: 10000000000,
    authUrl: 'https://www.google.com'
  };
  