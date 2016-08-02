
exports.View=function(template,model){
    this.template=template;
    this.model=model;
    this.exceptions=[];

    this.addException=function(exception){

        this.exceptions.push(exception);

        return this;
    }
}

exports.get = function(template,model){
    return new this.View(template,model);
}

/**
 *
 * @param {object} model
 * @param {string} method
 * @param {string} controller
 * @param {string} action
 * @param {callback} callback - expects two parameters: html,http_status_code
 */
exports.applyDefaultTemplate=function(model,method,controller,action,callback){
    var fs = require('fs');
    var handlebars=require('handlebars');
    var exceptions=require('../lib/exceptions');
    var templatePath=__dirname + '/../views/'+controller+'/'+action+'.html';
    var responseCode=null;

    var template={};
    var renderTemplate=function(model,template){
        if(model instanceof exports.View) {
            if (model.exceptions.length > 0) {
                responseCode = model.exceptions[model.exceptions.length - 1].code;
            }
            html=template({model:model.model,exceptions:model.exceptions});
        }else{
            html=template({model:model});
        }
        callback(html,responseCode);
    }
    if(typeof templateCache[templatePath]==='undefined'){
        fs.readFile( templatePath, function (err, data) { // TODO: can this be cached?
            var html="";
            if (err) {
                //TODO: if action is 404 then traverse the views folder looking for the first 404.html file
                //TODO: returning empty html sucks. Can I return a default top level 404 page?
                responseCode=500;
            }else{
                var template=handlebars.compile(data.toString()); //TODO: can this be cached?
                templateCache[templatePath]=template;

                if(model instanceof exports.View) {
                    if (model.exceptions.length > 0) {
                        responseCode = model.exceptions[model.exceptions.length - 1].code;
                    }
                    html=template({model:model.model,exceptions:model.exceptions});
                }else{
                    html=template({model:model});
                }

            }
            callback(html,responseCode);
        });
    }else{
        renderTemplate(model,templateCache[templatePath]);
    }




}