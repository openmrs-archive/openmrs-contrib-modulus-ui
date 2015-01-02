module.exports = {

  // Configuration relating to Modulus Core.
  api: {

    // Base URL of the lcoation where Modulus Core is running. Do not include
    // `/api` in the base URL.
    baseUrl: 'http://localhost:8080',

    // Set to `true` to disable writable actions on the Modulus API, such as
    // uploading releases or editing modules.
    readOnly: false
  },

  // URL where this instance of Modulus UI will be publicly accessible  
  appUrl: 'http://localhost:8083',

  // OAuth Client credentials
  auth: {
    authenticateUrl: 'http://localhost:8080/login?provider=openmrsid',
    clientId: 'd3eb9260-7f5b-11e4-9b8d-0fb70cf652f2'
  }
}
