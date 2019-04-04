import { expect } from 'chai';
import { model } from 'mongoose';
import Quiz from '../../src/schemas/QuizSchema';
import TeamSchema from '../../src/schemas/TeamSchema';

const assert = require('assert'); // imports the Pokemon model.
// const model = require('mongoose');

describe('Quiz assertions', () => {
  describe('Quiz model creation', () => {
    let quiz;

    beforeEach(done => {
      quiz = new Quiz({ name: 'test' });
      quiz.save().then(() => done());
    });

    it('creates a Quiz', done => {
      // assertion is not included in mocha so
      // require assert which was installed along with mocha
      Quiz.findOne({ name: 'test' }).then(result => {
        assert(result.name === 'test');
        done();
      });
    });

    it('fails creating a Quiz without a name', done => {
      const quiz = new Quiz();
      quiz.save().catch(err => {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('a quiz must be open when created', done => {
      // const quiz = new Quiz({ name: 'test' });
      Quiz.findOne({ name: 'test' }).then(result => {
        assert(result.open === true);
        done();
      });
    });

    it('must contain an empty array for teams', done => {
      // const quiz = new Quiz({ name: 'test' });
      Quiz.findOne({ name: 'test' }).then(result => {
        expect(result.teams).to.be.instanceOf(Array);
        expect(result.teams).to.be.empty;
        done();
      });
    });

    it('must contain an empty array for rounds', done => {
      // const quiz = new Quiz({ name: 'test' });
      Quiz.findOne({ name: 'test' }).then(result => {
        expect(result.rounds).to.be.instanceOf(Array);
        expect(result.rounds).to.be.empty;
        done();
      });
    });
  });

  describe('Adjusting existing Quiz', () => {
    let quizTest;

    beforeEach(done => {
      quizTest = new Quiz({ name: 'test-members' });
      quizTest.save().then(() => done());
    });

    it('should accept valid teams', done => {
      const TeamModel = model('Team', TeamSchema);
      const team = new TeamModel({
        name: 'test-team',
        members: ['test1', 'test2']
      });

      Quiz.findOneAndUpdate(
        { name: 'test-members' },
        {
          $push: { teams: team }
        }
      ).then(() => done());
    });

    it('should not accept teams without name', done => {
      const TeamModel = model('Team', TeamSchema);
      const team = new TeamModel({
        members: ['test1', 'test2']
      });

      Quiz.findOneAndUpdate(
        { name: 'test-members' },
        {
          $push: { teams: team }
        },
        { runValidators: true, new: true }
      ).catch(err => {
        expect(err.errors.teams.name).to.exist;
        done();
      });
    });

    it('should not accept teams with less than 2 teams', done => {
      const TeamModel = model('Team', TeamSchema);
      const team = new TeamModel({
        name: 'test-teams',
        members: ['test1']
      });

      Quiz.findOneAndUpdate(
        { name: 'test-members' },
        {
          $push: { teams: team }
        },
        { runValidators: true, new: true }
      ).catch(err => {
        expect(err.errors.teams.errors.members.message).to.equal(
          'members does not exceeds the limit of 2'
        );
        done();
      });
    });
  });
});
