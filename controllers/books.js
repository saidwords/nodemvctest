var view = require('../lib/view.js');
var exceptions=require('../lib/exceptions.js');

/**
 * Creates a new book
 *
 * @returns {int} - id of the book that was cre
 * @constructor
 */
exports.POST=function(title){
    if(typeof title === 'undefined' || title===null){
        throw new exceptions.MissingRequireParameterException('title');
    }

    //TODO: call business logic
    //var model=somelib.somefunction(x);

    // add the book to the book database, check for duplicate title
    var exists=false;
    booksDatabase.forEach(function(book,i){
       if(book.title===title){
          exists=true;
       }
    });

    if(exists){
        return false;
    }
    var id = booksDatabase.length;

    booksDatabase.push({id:id,title:title});

    return id;
}

/**
 *
 * @param {int} id
 * @returns {book}
 */
exports.GET=function(id){

    if(typeof id === 'undefined'){
        ;//TODO: throw MissingRequiredParameterException('id');
    }

    // simulate a database lookup for a book
    var model=null;
    booksDatabase.forEach(function(book,i){
        if(book.id==id){
            model=booksDatabase[i]
        }
    });

    if(model===null){ // book not found
        // return a view with exception
        return view.get('views/books/GET.html',model).addException(new exceptions.NotFoundException('book not found'));
    }

    return view.get('views/books/GET.html',model);

}

/**
 * Updates the given book with the given params
 *
 * @param id
 * @param params
 */
exports.PUT=function(id,title){
    //find the book and update it
    var idx=false;
    booksDatabase.forEach(function(book,i){
        if(book.id==id){
            idx=i;
        }
    });

    if(idx===false){
        throw new exceptions.NotFoundException();
    }
    booksDatabase[idx].title=title;

    return true;
}

/**
 * Deletes the given book
 * @param id
 * @constructor
 */
exports.DELETE=function(id){
    var idx=false;

    booksDatabase.forEach(function(book,i){
        if(book.id==id){
            idx=i;
        }
    });

    if(idx===false){
        return false;
    }

    booksDatabase.splice(idx,1);
    return true;
}

/**
 *
 * returns the total number of books in the database
 *
 * @param {int} id
 * @returns {int}
 */
exports.total=function(id){
    return booksDatabase.length;
}

/**
 * demonstrates how the framework behaves when a function has bad code
*/
exports.bad_code=function(){
    x.y=1; // this will cause an error that the framework should handle gracefully
}

/**
 * deomstrates how the framework behaves when a function is missing its default template
 * @param {int} id
 */
exports.missing_template=function(id){
    return true;
}

/**
 * Demonstrates how the framework behaves when a function throws an exception
 */
exports.return_exception=function(){
    throw new exceptions.NotFoundException('something wasnt found!');
}