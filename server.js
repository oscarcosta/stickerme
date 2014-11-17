#!/bin/env node
//  OpenShift Node application
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

/**
 *  Define the application.
 */
var StickerMe = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof(self.ipaddress) === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating app ...',
                        Date(Date.now()), 
                        sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */
    
    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();

        var user = require('./routes/user');
        var images = require('./routes/images');
        var pages = require('./routes/pages');
        
        //  Uses the Connect frameworks body parser to the post request  
        self.app.use(bodyParser());
        self.app.use(multer({dest: images.UPLOAD_PATH}));
        
        //  Add handlers for the app (from the routes).
        self.app.use(user.routes());
        self.app.use(images.routes());
        self.app.use(pages.routes());

        //  Error handling
        self.app.use(function(err, req, res, next) {
            console.error(err);
            res.send(500, {status: 500, 
                           message: 'Internal Error', 
                           type: 'internal'});
        });
    };

    /**
     *  Initializes the application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();
        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now()), 
                        self.ipaddress,
                        self.port);
        });
    };

};   /*  Application.  */

/**
 *  main():  Main code.
 */
var stickerMeApp = new StickerMe();
stickerMeApp.initialize();
stickerMeApp.start();
