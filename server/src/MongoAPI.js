import { mongoose, model } from 'mongoose';
import { QuizSchema } from './schemas/QuizSchema';
import { QuestionSchema } from './schemas/QuestionSchema';
import { CategorySchema } from './schemas/CategorySchema';

export default () => {
  mongoose.connect('mongodb://localhost/quizzer');

  const Quiz = model('Quiz', QuizSchema);
  const Category = model('Category', CategorySchema);
  const Question = model('Question', QuestionSchema);

  return {
    deleteTeam: async (quizId, teamId) => {
      try {
        const query = { _id: quizId };
        const newQuiz = await Quiz.findOneAndUpdate(
          query,
          {
            $pull: { teams: { _id: [teamId] } }
          },
          { new: true }
        );
        return newQuiz;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    joinQuiz: async (quizId, team) => {
      console.log('New Team to join quiz');
      console.log(team);
      try {
        const query = {
          _id: quizId,
          'teams.name': { $ne: team.name }
        };
        // const quizTeam = await Team.create({
        //   name: team.name,
        //   members: team.members,
        // });

        const quiz = await Quiz.findOneAndUpdate(
          query,
          {
            $push: { teams: team }
          },
          { runValidators: true, new: true }
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
        throw err;
      }
    },

    // TODO: Decide wether to stick to this teamschema setup or previous setup.
    getTeam: async (quizId, teamId) => {
      try {
        const quiz = await Quiz.findOne(
          {
            _id: quizId
          },
          { teams: [teamId] }
        );
        console.log(quiz);
        const team = quiz.teams.find(findTeam => `${findTeam._id}` === teamId);
        // console.log('Found team:');
        console.log(team);
        return team;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    createQuiz: async quiz => {
      try {
        const newQuiz = await Quiz.create({ ...quiz });
        return newQuiz;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    findQuiz: async quizId => {
      try {
        const quiz = await Quiz.findById(quizId);
        return quiz;
      } catch (err) {
        console.log(err);
        throw err;
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
            $set: { open: false }
          }
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
          category: { $in: categoryIds }
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
        console.log('Found questions:');
        console.log(questions);
        return questions;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    getQuestion: async questionId => {
      try {
        const question = await Question.findById(questionId).populate('category');
        return question;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    setCurrentQuestion: async (quizId, roundId, questionId) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          { _id: quizId, 'rounds._id': roundId },
          {
            $push: {
              questions: {
                question: questionId,
                answers: []
              }
            }
          }
        );
        return quiz;
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    },

    // TODO: Finish this function.
    saveAnswer: async (quizId, roundId, questionId, teamId, answer) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          {
            _id: quizId,
            'rounds._id': roundId,
            'rounds.questions._id': questionId,
            'rounds.questions.answers.teamId': { $ne: teamId }
          },
          {
            $addToSet: {
              'rounds.$[round].questions.$[question].answers': {
                teamId,
                answer
              }
            }
          },
          {
            arrayFilters: [{ round: roundId, question: questionId, team: teamId }]
          },
          {
            'rounds.$[round].questions.$[question].answers.$': 1,
            new: true
          }
        );
        console.log('Answer saved');
        console.log(quiz);
        // const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
        //   answer => answer.teamId.equals(teamId),
        // );
        // TODO: Does not work at the moment.
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

    updateAnswer: async (quizId, roundId, questionId, teamId, answer) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          {
            _id: quizId,
            'rounds.questions.$[question].answers.teamId': teamId
          },
          {
            $inc: {
              'rounds.$[round].questions.$[question].answers.$[team]._version': 1
            },
            $set: {
              'rounds.$[round].questions.$[question].answers.$[team].answer': answer
            }
            // $push: {
            //   'currentRound.currentQuestion.answers.$.answers': {
            //     $each: [{ answer: answer }],
            //     $position: 0,
            //   },
            // },
          },
          {
            arrayFilters: [{ round: roundId, question: questionId, team: teamId }]
          },
          {
            'rounds.$[round].questions.$[question].answers.$': 1,
            new: true
          }
        );

        console.log('Answer updated.');
        console.log(quiz);
        // const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
        //   answer => answer.teamId.equals(teamId),
        // );
        // TODO: Does not work at the moment.
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

    getAnswer: async (quizId, roundId, questionId, teamId) => {
      try {
        const quiz = await Quiz.findOne(
          {
            _id: quizId,
            'rounds._id': roundId,
            'rounds.questions._id': questionId,
            'rounds.questions.answers.teamId': teamId
          },
          {
            arrayFilters: [{ round: roundId, question: questionId, team: teamId }]
          },
          {
            'rounds.$[round].questions.$[question].answers.$[team]': 1,
            new: true
          }
        );

        // const teamAnswer = quiz.currentRound.currentQuestion.answers.find(
        //   answer => answer.teamId.equals(teamId),
        // );
        // TODO: Does not work at the moment.
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

    setSelectedCategories: async (quizId, roundId, categoryIds) => {
      try {
        const quiz = await Quiz.findOneAndUpdate(
          { _id: quizId, 'rounds._id': roundId },
          {
            $push: {
              'rounds.$.selectedCategories': categoryIds
            }
          },
          { 'rounds.$': 1 }
        );
        // TODO: Returns wrong item.
        return quiz;
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
    }

    // startNextRound: async quizId => {
    //   try {
    //     const quiz = await Quiz.findByIdAndUpdate(
    //       { _id: quizId },
    //       {
    //         $push: { rounds: currentRound },
    //         currentRound: RoundSchema.create({
    //           number: currentRound.number + 1,
    //         }),
    //       },
    //     );
    //     return quiz.currentRound;
    //   } catch (err) {
    //     throw err;
    //   }
    // },
  };
};
