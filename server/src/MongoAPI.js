import { QuizSchema } from './schemas/QuizSchema';
import { QuestionSchema } from './schemas/QuestionSchema';
import { CategorySchema } from './schemas/CategorySchema';
import { model } from 'mongoose';
import { RoundSchema } from './schemas/RoundSchema';
import { TeamSchema } from './schemas/TeamSchema';
import { AnswerSchema } from './schemas/AnswerSchema';

export const MongoAPI = (url = '') => {
  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/quizzer');
  const db = mongoose.connection;

  const Quiz = model('Quiz', QuizSchema);
  const Category = model('Category', CategorySchema);
  const Question = model('Question', QuestionSchema);
  // const Team = model('Team', TeamSchema);
  // const Answer = model('Answer', AnswerSchema);

  return {
    deleteTeam: async (quizId, teamId) => {
      try {
        const query = { _id: quizId };
        const newQuiz = await Quiz.findOneAndUpdate(
          query,
          {
            $pull: { teams: { _id: [teamId] } },
          },
          { new: true },
        );
        return newQuiz;
      } catch (err) {
        console.log(err);
      }
    },

    joinQuiz: async (quizId, team) => {
      console.log('New Team to join quiz');
      console.log(team);
      try {
        const query = {
          _id: quizId,
          'teams.name': { $ne: team.name },
        };
        // const quizTeam = await Team.create({
        //   name: team.name,
        //   members: team.members,
        // });

        const quiz = await Quiz.findOneAndUpdate(
          query,
          {
            $push: { teams: team },
          },
          { runValidators: true, new: true },
        );

        console.log('New quiz after joining of team');
        console.log(quiz);
        if (quiz === null) {
          throw new Error('Team name already exists.');
        }
        return quiz;
      } catch (err) {
        throw new Error(err);
      }
    },

    getTeams: async quizId => {
      try {
        const quiz = await Quiz.findById(quizId);
        return quiz.teams;
      } catch (err) {
        console.log(err);
      }
    },

    // TODO: Decide wether to stick to this teamschema setup or previous setup.
    getTeam: async (quizId, teamId) => {
      try {
        const quiz = await Quiz.findOne(
          {
            _id: quizId,
          },
          { teams: [teamId] },
        );
        console.log(quiz);
        const team = quiz.teams.find(findTeam => '' + findTeam._id === teamId);
        console.log('Found team:');
        console.log(team);
        return team;
      } catch (err) {
        console.log(err);
      }
    },

    createQuiz: async quiz => {
      try {
        const newQuiz = await Quiz.create({ ...quiz });
        return newQuiz;
      } catch (err) {
        console.log(err);
      }
    },

    findQuiz: async quizId => {
      try {
        const quiz = await Quiz.findById(quizId);
        return quiz;
      } catch (err) {
        console.log(err);
      }
    },

    findQuizs: async () => {
      const quizs = await Quiz.find({});
      return quizs;
    },

    getOpenQuizs: async () => {
      const quizs = await Quiz.find({ open: true });
      return quizs;
    },

    closeQuiz: async quizId => {
      try {
        await Quiz.findOneAndUpdate(
          { _id: quizId, open: true },
          {
            $set: { open: false },
          },
        );
        return;
      } catch (err) {
        console.log(err);
      }
    },

    checkPass: async (quizId, password) => {
      const query = { _id: quizId, password: { $eq: password } };
      const quiz = await Quiz.findOne(query);
      console.log(quiz);
      if (quiz) {
        return true;
      }
      return false;
    },

    getRandomQuestions: async categoryIds => {
      console.log('Getting random questions');
      console.log(categoryIds);
      try {
        console.log('Getting random questions');
        const rowCount = await Question.count({
          category: { $in: categoryIds },
        });
        console.log(`Row count of questions: ${rowCount}`);
        const maxRandomNumber = rowCount - 20;
        console.log(`Maximum random number: ${maxRandomNumber}`);
        const randomNumber = Math.floor(Math.random() * maxRandomNumber);
        console.log(`Random number rolled: ${randomNumber}`);
        const query = { category: { $in: categoryIds } };
        const questions = await Question.find(query)
          .skip(randomNumber)
          .limit(20)
          .populate('category');
        console.log(`Found questions:`);
        console.log(questions);
        return questions;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    getQuestion: async questionId => {
      try {
        const question = await Question.findById(questionId).populate(
          'category',
        );
        return question;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    setCurrentQuestion: async (quizId, questionId) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          { _id: quizId },
          {
            'currentRound.currentQuestion': {
              question: questionId,
              answers: [],
            },
          },
        );
        return quiz.currentRound;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    // TODO: Finish this function.
    saveAnswer: async (quizId, teamId, answer) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          {
            _id: quizId,
            'currentRound.currentQuestion.answers.teamId': { $ne: teamId },
          },
          {
            $addToSet: {
              'currentRound.currentQuestion.answers': {
                teamId: teamId,
                answer: answer,
              },
            },
          },
          {
            fields: {
              'currentRound.currentQuestion.answers': 1,
            },
            new: true,
          },
        );
        console.log('Answer saved');
        console.log(quiz);
        const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
          answer => answer.teamId.equals(teamId),
        );
        if (teamAnswer) {
          return teamAnswer;
          // return {
          //   answer: teamAnswer.answers[0],
          //   version: teamAnswer.answers.length,
          // };
        }
        throw new Error('No team found in the array of answers.');
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    updateAnswer: async (quizId, teamId, answer) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          {
            _id: quizId,
            'currentRound.currentQuestion.answers.teamId': teamId,
          },
          {
            $inc: {
              'currentRound.currentQuestion.answers.$._version': 1,
            },
            $set: {
              'currentRound.currentQuestion.answers.$.answer': answer,
            },
            // $push: {
            //   'currentRound.currentQuestion.answers.$.answers': {
            //     $each: [{ answer: answer }],
            //     $position: 0,
            //   },
            // },
          },
          {
            fields: {
              'currentRound.currentQuestion.answers': 1,
            },
            new: true,
          },
        );

        console.log('Answer updated.');
        console.log(quiz);
        const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
          answer => answer.teamId.equals(teamId),
        );
        if (teamAnswer) {
          return teamAnswer;
          // return {
          //   answer: teamAnswer.answers[0],
          //   version: teamAnswer.answers.length,
          // };
        }
        throw new Error('No team found in the array of answers.');
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    getAnswer: async (quizId, teamId) => {
      try {
        const quiz = await Quiz.findOne(
          {
            _id: quizId,
            'currentRound.currentQuestion.answers.teamId': teamId,
          },
          {
            'currentRound.currentQuestion.answers': 1,
          },
        );

        const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
          answer => answer.teamId.equals(teamId),
        );
        if (teamAnswer) {
          return teamAnswer;
          // return {
          //   answer: teamAnswer.answers[0],
          //   version: teamAnswer.answers.length,
          // };
        }
        throw new Error('No team found in the array of answers.');
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    findCategories: async () => {
      try {
        const categories = await Category.find({});
        return categories;
      } catch (err) {
        throw new Error(err);
      }
    },

    setSelectedCategories: async (quizId, categoryIds) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          { _id: quizId },
          {
            $push: {
              'currentRound.selectedCategories': categoryIds,
            },
          },
        );
        return quiz.currentRound;
      } catch (err) {
        throw err;
      }
    },

    getAllQuestions: async () => {
      try {
        const categories = await Question.find({});
        return categories;
      } catch (err) {
        throw new Error(err);
      }
    },

    startNextRound: async quizId => {
      try {
        const quiz = await Quiz.findByIdAndUpdate(
          { _id: quizId },
          {
            $push: { rounds: currentRound },
            currentRound: RoundSchema.create({
              number: currentRound.number + 1,
            }),
          },
        );
        return quiz.currentRound;
      } catch (err) {
        throw err;
      }
    },
  };
};
