import { expect } from 'chai';
import Quiz from '../../src/schemas/QuizSchema';

const assert = require('assert'); // imports the Pokemon model.
// const model = require('mongoose');

describe('Team assertions', () => {
  describe('Team model creation', () => {
    let quiz;

    beforeEach(done => {
      quiz = new Quiz({ name: 'test' });
      quiz.save().then(() => done());
    });

    // it('creates a Quiz', done => {
    //   // assertion is not included in mocha so
    //   // require assert which was installed along with mocha
    //   Quiz.findOne({ name: 'test' }).then(result => {
    //     assert(result.name === 'test');
    //     done();
    //   });
    // });
  });
});
