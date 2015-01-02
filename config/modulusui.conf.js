module.exports = {

  // Configuration relating to Modulus Core.
  api: {

    // Base URL of the lcoation where Modulus Core is running. Do not include
    // `/api` in the base URL.
    baseUrl: '/modulus',

    // Set to `true` to disable writable actions on the Modulus API, such as
    // uploading releases or editing modules.
    readOnly: false
  },

  // URL where this instance of Modulus UI will be publicly accessible  
  appUrl: 'http://localhost:3001',

  // OAuth Client credentials
  auth: {
    authenticateUrl: 'http://localhost:8080/login?provider=openmrsid',
    clientId: '8fa0753531217077ab449c37a4d0bd5b'
  }
}
