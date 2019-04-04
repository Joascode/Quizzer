// inside tests/test_helper.js

const mongoose = require('mongoose');

// tell mongoose to use es6 implementation of promises
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/quizzertest');
mongoose.connection
  .once('open', () => console.log('Connected!'))
  .on('error', error => {
    console.warn('Error : ', error);
  });

before(done => {
  mongoose.connection.on('open', () => {
    done();
  });
});

// Called hooks which runs before something.
beforeEach(done => {
  // mongoose.connection.on('open', () => {
  mongoose.connection.db.dropCollection('quiz', (err, result) => {
    // this function runs after the drop is completed
    console.log('Dropped DB');
    done(); // go ahead everything is done now.
  });
  // });
});
