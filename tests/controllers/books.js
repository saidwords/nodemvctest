var assert = require('assert');
var request = require('supertest');

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function runPUTtestCases(books) {
    var updatedBooks = [];
    after(function () {
        runDELETEtestCases(updatedBooks);
    });

    describe('PUT', function () {
        it('should return 404 and false when book not found', function (done) {
            var updatedTitle = 'Cinnamon Shops ' + randomString(8);
            request('http://127.0.0.1:8000')
                .put('/json/books/123456/' + updatedTitle)
                .end(function (err, res) {
                    assert.equal(404, res.statusCode);
                    assert.equal(null, res.body.model);
                    done();
                });
        });

        books.forEach(function (book, i) {
            var updatedTitle = 'Cinnamon Shops ' + randomString(8);
            updatedBooks.push({id: book.id, title: updatedTitle});
            var url = '/json/books/' + book.id + '/' + updatedTitle;
            it(url + ' should update title and return true', function (done) {
                request('http://127.0.0.1:8000')
                    .put(url)
                    .end(function (err, res) {
                        assert.equal(200, res.statusCode);
                        assert.equal(true, res.body.model);
                    });

                request('http://127.0.0.1:8000')
                    .get('/json/books/' + book.id)
                    .end(function (err, res) {
                        assert.equal(200, res.statusCode);
                        assert.equal(updatedTitle, res.body.model.title);
                    });
                done();
            });
        });

    });
}

function runGETtestCases(books) {

    describe('GET', function () {

        after(function () {
            runPUTtestCases(books);
        });

        var testCombinations = [
            [0, 0, 0], // isjon, param as segment, param as query string
            [0, 0, 1],
            [0, 1, 0],
            [0, 1, 1],
            [1, 0, 0],
            [1, 0, 1],
            [1, 1, 0],
            [1, 1, 1]
        ];

        var req = request('http://127.0.0.1:8000');

        //console.log(books);

        books.forEach(function (book,i) {
            if(i==0) { //TODO: remove this
                testCombinations.forEach(function (testCase) {
                    var should = 'should';
                    var url = "/";
                    if (testCase[0] === 1) {
                        url += 'json/';
                        should += ' return json';
                    } else {
                        should += ' return html';
                    }
                    url += 'books/';

                    if (testCase[2] === 1) {
                        if (testCase[1] === 1) {
                            url += book.id + 1;
                        }
                        url += '?id=' + book.id;
                    } else {
                        if (testCase[1] === 1) {
                            url += book.id;
                        }
                    }

                    if (testCase[1] === 0 && testCase[2] === 0) {
                        should += ' 404';
                    } else {
                        should += ' 200';
                    }
                    it(url + ' ' + should, function (done) {
                        req.get(url)
                            .end(function (err, res) {
                                if (testCase[0] === 0) { // expect html to be returned
                                    if (testCase[1] === 0 && testCase[2] === 0) { //expect no data returned
                                        assert.equal(404, res.statusCode);
                                        assert.notEqual(-1, res.text.indexOf('<p>title:</p>'));
                                    } else {
                                        assert.equal(200, res.statusCode);
                                        assert.notEqual(-1, res.text.indexOf('<p>title:' + book.title + '</p>'));
                                    }
                                } else { // expect json to be returned
                                    if (testCase[1] === 0 && testCase[2] === 0) { //expect no data returned
                                        assert.equal(404, res.statusCode);
                                        assert.equal(null, res.body.model);
                                    } else {
                                        assert.equal(200, res.statusCode);
                                        assert.equal(book.title, res.body.model.title);
                                        assert.equal(book.id, res.body.model.id);

                                    }
                                }
                                done();
                            });
                    });
                });
            }
        });


    });
};



describe('books', function () {
    var book = {title: 'Street of Crocodiles '};

    var runDELETEtestCases = function (books) {
        describe('DELETE', function () {
            books.forEach(function (book) {
                var url = '/json/books/' + book.id;
                it(url + ' should delete book', function (done) {
                    request('http://127.0.0.1:8000')
                        .get(url)
                        .end(function (err, res) {
                            assert.equal(200, res.statusCode);
                            assert.equal(book.id, res.body.model.id);
                            request('http://127.0.0.1:8000')
                                .del(url)
                                .end(function (err, res) {
                                    assert.equal(200, res.statusCode);
                                    assert.equal(true, res.body.model);

                                    request('http://127.0.0.1:8000')
                                        .get(url)
                                        .end(function (err, res) {
                                            assert.equal(404, res.statusCode);
                                            assert.equal(null, res.body.model);
                                        });
                                    done();
                                });

                        });
                });
            });
        });
    };


/*
    describe('POST', function () {


        var books = [];
        after(function () {
            runGETtestCases(books);
        });

        var testCombinations = [
            //[0, 0, 0, 0], // isjon, param as segment, param as query string, param as form
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 1],
            [1, 0, 1, 0],
            [1, 1, 0, 0]
        ];
        var req = request('http://127.0.0.1:8000');
        var id = 0;

        testCombinations.forEach(function (testCase, i) {
            var title = 'Street of Crocodiles ' + randomString(32);
            var should = 'should';
            var url = "/";
            if (testCase[0] === 1) {
                url += 'json/';
                should += ' return json';
            } else {
                should += ' return html';
            }
            url += 'books/';

            if (testCase[2] === 1) {
                if (testCase[1] === 1) {
                    url += title + '1';
                }
                url += '?title=' + title;
            } else {
                if (testCase[1] === 1) {
                    url += title;
                }
            }

            if (testCase[1] === 0 && testCase[2] === 0 && testCase[3] === 0) {
                should += ' 400';
            } else {
                should += ' 201';
            }

            var foo = req.post(url);
            if (testCase[3] === 1) {
                var bar = foo.type('form').field('title', title);
            } else {
                var bar = foo;
            }



            it(url + ' ' + should, function (done) {
                bar.end(function (err, res) {
                    if (testCase[0] === 0) { // expect html to be returned
                        if (testCase[1] === 0 && testCase[2] === 0 && testCase[3] === 0) {
                            assert.equal(400, res.statusCode);
                            assert.notEqual(-1, res.text.indexOf("exception='Missing required parameter: title'"));
                        } else {
                            assert.equal(201, res.statusCode);
                            var i1 = res.text.indexOf('book.id=');
                            var i2 = res.text.indexOf('</p>');
                            id = res.text.substr(i1 + 8, (i2 - i1 - 8));

                            books.push({id: id, title: title});
                            assert.notEqual(-1, res.text.indexOf("<p>created book.id=" + id + "</p>"));
                        }

                    } else { // expect json to be returned
                        if (testCase[1] === 0 && testCase[2] === 0 && testCase[3] === 0) {
                            assert.equal(400, res.statusCode);
                            assert.equal('Missing required parameter: title', res.body.exceptions[0].message);
                            assert.equal(400, res.body.exceptions[0].code);
                        } else {
                            assert.equal(201, res.statusCode);
                            id = res.body.model;
                            books.push({id: id, title: title});
                            assert.equal(typeof id, 'number');
                            assert(id > -1);
                        }
                    }
                });
                done();
            });

        });

    });

    */


});

/*
describe('GET', function () {
    it('/books/missing_template should return 500 ', function (done) {
        request('http://127.0.0.1:8000')
            .get('/books/missing_template/')
            .end(function (err, res) {
                assert.equal(500, res.statusCode);
                assert.equal("",res.text);
                done();
            });
    });
});
*/


describe('POST', function () {

    var books = [];
    after(function () {
        runGETtestCases(books);
    });

    var id=0;
    var title='Cinnamon Shops ' + randomString(8);
    it('/books/ should return html 201 ', function (done) {
        request('http://127.0.0.1:8000')
            .post('/json/books/'+title)
            .end(function (err, res) {
                assert.equal(201, res.statusCode);
                id=res.body.model;
                assert(id>-1);
            });

        done();
    });

    it('/books/missing_template should return 500',function(done){
        request('http://127.0.0.1:8000')
            .get('/books/missing_template/')
            .end(function (err, res) {
                assert.equal(500, res.statusCode);
                assert.equal("",res.text);
                done();
            });

    });

    it('/books/'+id+' should return html 200',function(done){
        request('http://127.0.0.1:8000')
            .get('/books/'+id)
            .end(function (err, res) {
                assert.equal(200, res.statusCode);
                done();
            });

    });

    it('/json/books/'+id+' should return json 200',function(done){
        request('http://127.0.0.1:8000')
            .get('/json/books/'+id)
            .end(function (err, res) {
                assert.equal(200, res.statusCode);
                done();
            });
    });

    it('/json/books/12345 should return json 404',function(done){
        request('http://127.0.0.1:8000')
            .get('/json/books/12345')
            .end(function (err, res) {
                assert.equal(404, res.statusCode);
                assert.equal(null,res.body.model);
                done();
            });

    });

});

/*
describe('PUT', function () {
    it('should return 404 and null when book not found', function (done) {
        var updatedTitle = 'Cinnamon Shops ' + randomString(8);
        request('http://127.0.0.1:8000')
            .put('/json/books/123456/' + updatedTitle)
            .end(function (err, res) {
                assert.equal(404, res.statusCode);
                assert.equal(null, res.body.model);
                done();
            });
    });
});
*/
// TODO: test POST/GET/PUT/DELETE to a nonexistent url

//TODO: test an unsupported method like HEAD

//TODO: what happens when you call GET but there is no controller.GET() function?

//TODO: verify that all /json/* calls return exceptions properly

/**

 in a controller, if return {title: 'Street of Crocodiles'};
 when an exception occurs then it is appended to the model as key 'exceptions'

 json/exception
 ----/--------
 1      0 = return book; = {model:{title:'Street of Crocodiles'}} // exceptions not returned
 1      1 = throw Exception() = {model:null,exceptions:[{code:404,message:'book not found'}]}}
 1      1 = return Exception = {model:{code:404}} // exceptions not returned
 1      1 = return view.addException = {model:{title:null},exceptions:[{code:404}]}
 0      0 = return book = {{model.title}} {{model.exceptions}} // exceptions will be empty array
 0      1 = return view.addException = {{model.title}} {{model.exceptions}} // exceptions will contain array of exception objects
 0      1 = throw Exception = {{model.title}} {{model.exceptions}} // model will be null. exceptions will contain array of exception objects
 0      1 = return Exception() = {{model.title}} {{model.exceptions}} // model will contain the exception. exceptions will be empty array

 // TODO: consider that inside a view is there a way to type-hint the model that is expected to be passed to the view?

 */