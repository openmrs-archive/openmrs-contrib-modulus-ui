Modulus UI
=====

This is the web-based reference interface for [Modulus][1], the OpenMRS Module Repository. It's scaffolded from [angular-seed][2].

    $ git clone https://github.com/elliottwilliams/openmrs-contrib-modulus-ui.git
    $ cd openmrs-contrib-modulus-ui

    $ npm install

Set environment variable `MODULUS_API_BASE_URL` to the URL for your Modulus server's api. For example:

    $ export MODULUS_API_BASE_URL=http://localhost:8080/api

Then run `grunt build` to configure the application.

---

Modulus UI can be served statically (from the `app` directory). To run the development server, which will compile live-reload LESS stylesheets, run

    $ grunt serve


[1]: https://github.com/elliottwilliams/openmrs-contrib-modulus
[2]: https://github.com/angular/angular-seed