exports.Exception=function(message,code){
    this.message=message;
    this.code=code;
}

exports.NotFoundException=function(message){
    this.message=message;
    this.code = 404;
}
exports.NotFoundException.prototype = Object.create(exports.Exception.prototype);

exports.MissingRequireParameterException=function(message){
    this.message='Missing required parameter: '+message;
    this.code = 400;
}
exports.MissingRequireParameterException.prototype = Object.create(exports.Exception.prototype);