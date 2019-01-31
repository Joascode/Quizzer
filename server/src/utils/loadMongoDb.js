import { CategorySchema } from '../schemas/CategorySchema';
import { QuestionSchema } from '../schemas/QuestionSchema';
import { model } from 'mongoose';
import { QuizSchema } from '../schemas/QuizSchema';
import { AnswerSchema } from '../schemas/AnswerSchema';
import { TeamSchema } from '../schemas/TeamSchema';

export const load = questions => {
  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/quizzer');
  mongoose.connection.dropDatabase();
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    // we're connected!
    const CategoryModel = model('Category', CategorySchema);
    const QuestionModel = model('Question', QuestionSchema);
    const Quiz = model('Quiz', QuizSchema);
    const Team = model('Team', TeamSchema);
    const Answer = model('Answer', AnswerSchema);

    const categories = new Set();
    questions.forEach(question => {
      categories.add(question.category);
    });
    const categoriesArray = Array.from(categories);
    Quiz.create({});
    Team.create({});
    Answer.create({});

    const savedCats = [];
    const algemeenQuestions = [];
    const etenEnDrinkenQuestions = [];
    const geschiedenisQuestions = [];
    const filmEnTVQuestions = [];
    const muziekQuestions = [];
    const sportQuestions = [];
    const wetenschapEnTechniekQuestions = [];

    questions.forEach((question, index) => {
      console.log('Pushing question.');
      console.log(question);
      switch (question.category) {
        case 'Algemeen':
          algemeenQuestions.push(question);
          break;
        case 'Eten en Drinken':
          etenEnDrinkenQuestions.push(question);
          break;
        case 'Geschiedenis':
          geschiedenisQuestions.push(question);
          break;
        case 'Film en TV':
          filmEnTVQuestions.push(question);
          break;
        case 'Muziek':
          muziekQuestions.push(question);
          break;
        case 'Sport':
          sportQuestions.push(question);
          break;
        case 'Wetenschap en Techniek':
          wetenschapEnTechniekQuestions.push(question);
          break;
        default:
          break;
      }
    });

    CategoryModel.insertMany(
      [
        {
          category: 'Algemeen',
        },
        { category: 'Eten en Drinken' },
        { category: 'Geschiedenis' },
        { category: 'Film en TV' },
        { category: 'Muziek' },
        { category: 'Sport' },
        { category: 'Wetenschap en Techniek' },
      ],
      function(err, docs) {
        console.log(docs);
        questions.forEach((question, index) => {
          const randomCategory = Math.floor(
            Math.random() * categoriesArray.length,
          );
          console.log(randomCategory);
          const category = docs[randomCategory];
          console.log(category);

          switch (category.category) {
            case 'Algemeen': {
              saveRandomQuestion(algemeenQuestions, category._id);
              break;
            }
            case 'Eten en Drinken': {
              saveRandomQuestion(etenEnDrinkenQuestions, category._id);
              break;
            }
            case 'Geschiedenis': {
              saveRandomQuestion(geschiedenisQuestions, category._id);

              break;
            }
            case 'Film en TV': {
              saveRandomQuestion(filmEnTVQuestions, category._id);
              break;
            }
            case 'Muziek': {
              saveRandomQuestion(muziekQuestions, category._id);
              break;
            }
            case 'Sport': {
              saveRandomQuestion(sportQuestions, category._id);
              break;
            }
            case 'Wetenschap en Techniek': {
              saveRandomQuestion(wetenschapEnTechniekQuestions, category._id);
              break;
            }
            default:
              break;
          }
        });
      },
    );

    const saveRandomQuestion = (questionArray, catId) => {
      const randomQuestion = Math.floor(Math.random() * questionArray.length);
      const question = questionArray[randomQuestion];
      if (question) {
        setTimeout(() => {
          questionArray.splice(randomQuestion, 1);
          saveQuestion(question, catId);
        }, 50);
      }
    };

    const saveQuestion = (question, catId) => {
      const quest = new QuestionModel({
        question: question.question,
        answer: question.answer,
        category: catId,
      });
      quest.save((err, savedQuest) => {
        if (err) console.log(err);
        console.log(savedQuest);
      });
    };

    QuestionModel.findOne({
      question: 'Bij welke sport kan men de titel Mr. Olympia behalen?',
    })
      .populate('category')
      .exec((err, question) => {
        if (err) return console.log(err);
        console.log(question);
      });
  });
};
