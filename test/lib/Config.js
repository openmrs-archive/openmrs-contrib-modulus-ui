beforeEach(function() {
  var config = this.config = {
    api: {
      baseUrl: 'http://server.local'
    },
    appUrl: 'http://client.local',
    auth: {
      authenticateUrl: 'http://example.com/authenticate',
      clientId: 'foobar123'
    }
  };

  module(function($provide) {
    $provide.constant('Config', config);
  })
});

