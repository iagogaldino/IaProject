// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Configuração dinâmica baseada no ambiente
const getApiUrl = () => {
  // Se estiver rodando no Docker (porta 4200), usar nome do serviço
  if (window.location.port === '4200') {
    return 'http://app-backend:3000';
  }
  // Se estiver rodando localmente (porta diferente), usar localhost
  return 'http://localhost:3000';
};

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
