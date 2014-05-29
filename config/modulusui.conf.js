module.exports = {

  // Configuration relating to Modulus Core.
  api: {

    // Base URL of the lcoation where Modulus Core is running. Do not include
    // `/api` in the base URL.
    baseUrl: 'http://localhost:8080',

    // Set to `true` to disable writable actions on the Modulus API, such as
    // uploading releases or editing modules.
    readOnly: true
  }
}