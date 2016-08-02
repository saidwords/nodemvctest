// Load the http module to create an http server.
var http = require('http');
var url = require('url');
var qs = require('querystring');
var handlebars = require('handlebars');
var formidable = require('formidable');
var view = require('./lib/view.js');
var exceptions = require('./lib/exceptions.js');

/**
 * global.booksDatabase is here just for simulating a database for the 'books' unit tests.
 */
global.booksDatabase=[];

global.templateCache=[];

function Router(){
    this.responseCode=200;
    this.controllerName=false;
    this.action=false;
}
// todo: cache this function
Router.prototype.argumentNames=function(fun) {
    var names = fun.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
        .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
        .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
}

Router.prototype.sendOutput=function(model,exception){
    //console.log('sending output...');console.log(model);

    if(this.segments[1]==='json'){ // if client has requested json
        //if model is a view then json encode its model
        //console.log('sending as json');
        if(model instanceof view.View) {
            if (model.exceptions.length > 0) {
                this.responseCode = model.exceptions[model.exceptions.length - 1].code;
            }
            this.response.writeHead(this.responseCode, {"Content-Type": "application/json"});
            this.response.end(JSON.stringify({model: model.model, exceptions: model.exceptions}));
        }else{
            if(typeof exception !=='undefined'){
                this.responseCode=exception.code;
                this.response.writeHead(this.responseCode, {"Content-Type": "application/json"});
                this.response.end(JSON.stringify({model:model,exceptions:[exception]}));
            }else{
                this.response.writeHead(this.responseCode, {"Content-Type": "application/json"});
                this.response.end(JSON.stringify({model:model}));
            }
        }
    }else{

        view.applyDefaultTemplate(model,this.request.method,this.controllerName,this.action,function(html,responseCode){
            if(typeof responseCode === 'number'){
                this.responseCode=responseCode;
            }
            this.response.writeHead(this.responseCode, {"Content-Type": "text/html"});
            this.response.end(html);
        }.bind(this));

    }
}

Router.prototype.run=function(response,request,formData){
    var model=null;
    this.response=response;
    this.request=request;

    var url_parts = url.parse(request.url,true);

    this.segments=decodeURI(url_parts.pathname).split("/"); //TODO: url decode
    if(this.segments[this.segments.length-1]===''){
        this.segments.pop();
    }
    var f1=1;
    if(this.segments[f1]==='json'){
        f1++;
    }

    //TODO: first check if request is for static file?
    this.action=this.segments[f1+1];

    try{
        var argsArray=[];
        this.controllerName=this.segments[f1];
        var controller = require('./controllers/'+this.segments[f1]+'.js');
        f1++;

        //look for an action in the controller
        if(typeof controller[this.action] === 'undefined') {
            // if the action doesn't exist then default to the request method
            this.action=request.method;
            if(typeof controller[this.action] === 'undefined') {
                // if the action still doesnt exist then error 404?
                //controller=error, action=404
                ;
            }
        }

        var params = this.argumentNames(controller[this.action]); //TODO: support returning the datatype from the functions doc tags

        //apply formdata
        if(formData!==false){
            params.forEach(function (item, i) {
                if (typeof formData[item] == 'undefined') {
                    if (typeof argsArray[i] === 'undefined') {
                        argsArray[i] = null;
                    }
                } else {
                    argsArray[i] = formData[item];
                }
            });
        }

        // apply positional parameters (overriding form data)
        if(this.segments.length>f1){
            this.segments.forEach(function(item,i){
                if(i>=f1){
                    argsArray.push(item);
                }
            });
        }

        // apply query string parameters (override any positional parameters
        params.forEach(function (item, i) {
            if (typeof url_parts.query[item] == 'undefined') {
                if (typeof argsArray[i] === 'undefined') {
                    argsArray[i] = null;
                }
            } else {
                argsArray[i] = url_parts.query[item];
            }
        });

        if(request.method=='GET'){
            this.responseCode=200;
            model=controller[this.action].apply(controller,argsArray);
            this.sendOutput(model);
        }else if(request.method=='POST'){
            this.responseCode=201;
            model=controller[this.action].apply(controller,argsArray);
            this.sendOutput(model);
        }else if(request.method=='PUT'){
            this.responseCode=200;
            model=controller[this.action].apply(controller,argsArray);
            this.sendOutput(model);
        }else if(request.method=='DELETE'){
            this.responseCode=200;
            model=controller[this.action].apply(controller,argsArray);
            this.sendOutput(model);
        }else{
            this.responseCode=405; // Method Not Allowed
            this.sendOutput(false);
        }

    }catch(e){
        this.responseCode=e.code;
        this.sendOutput(null,e);
        //console.log(e);
//        this.response.writeHead(this.responseCode, {"Content-Type": "application/json"});
//        this.response.end(JSON.stringify({model:{},exceptions:[e]}));
    }
}

var server = http.createServer(function (request, response) {
    var router = new Router();
    // parse any form data
    var formData=false;
    if(typeof request.headers['content-type'] !== 'undefined'){
        if(request.headers['content-type'].indexOf('multipart/form-data')!==-1){
            var form = new formidable.IncomingForm();
            form.parse(request, function (err, formData, files) {
                router.run(response, request, formData);
            });
        }else if(request.headers['content-type'].indexOf('x-www-form-urlencoded')!==-1) {
            var body='';

            request.on('data', function (data) {
                body += data;
                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6)
                    request.connection.destroy();
            });

            request.on('end', function () {
                formData = qs.parse(body);
                router.run(response,request,formData);
            });

        }else{
            router.run(response,request,formData);
        }
    }else{
        router.run(response,request,formData);
    }

});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
