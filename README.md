Modulus UI
=====

This is the web-based interface of [Modulus][1], the OpenMRS Modules directory. It's a static, single-page web application written in AngularJS and provides a frontend to Modulus's REST API.

Building
-----

1. You need [Node][0] v0.8 or greated installed.

2. Clone the source code:

        $ git clone https://github.com/openmrs/openmrs-contrib-modulus-ui.git
        $ cd openmrs-contrib-modulus-ui
        
3. Install all dependencies:

        $ npm install
    
        # If you don't already have grunt installed on your system:
        $ npm install -g grunt-cli
        
4. Set environment variable `MODULUS_API_BASE_URL` to the URL for your Modulus server's api:

        $ export MODULUS_API_BASE_URL=http://localhost:8080/api

5. Build & run:

        # To build a static copy of Modulus UI in ./app:
        $ grunt build
        
        # To run a development server:
        $ grunt serve

---

Contribute
-----

We'd love it if you'd like to give ideas, code contributions, or criticisms.

Most feedback and development coordination is on the [MOD JIRA Project][3].

Continous deployment is managed on [OpenMRS CI][4]. `master` auto-deploys to https://modules-stg.openmrs.org and `prod` auto-deploys to https://modules.openmrs.org

[0]: http://nodejs.org
[1]: https://github.com/elliottwilliams/openmrs-contrib-modulus
[2]: https://github.com/angular/angular-seed
[3]: https://tickets.openmrs.org/browse/MOD
[4]: https://ci.openmrs.org/browse/MOD-UI
