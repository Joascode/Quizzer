// import Mongoose from 'mongoose';

// const mongoDB = 'mongodb://127.0.0.1/quizzer';

// Mongoose.connect(mongoDB);

// const db = Mongoose.connection;

// db.on('error', () => console.log('MongoDB connection error'));
import express from 'express';
import bodyparser from 'body-parser';
import http from 'http';
import { load } from './utils/loadMongoDb';
import MongoAPI from './MongoAPI';
import { websocketAPI } from './WebsocketAPI';
import vragen from '../vragen.json';

const app = express();
const port = 8080;
const api = MongoAPI();

const handleError = (res, err, code) => {
  res.status(code).json({ errorMsg: err });
};

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyparser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Cookie'
  );
  next();
});

http.createServer(app).listen(port, () => console.log(`Example app listening on port ${port}!`));
websocketAPI();
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// if (process.argv[2] === 'resetdb') {
//   load(vragen);
// }

app.get('/resetdb', () => {
  load(vragen);
});

app.get('/categories', async (req, res) => {
  try {
    const cats = await api.findCategories();
    console.log(cats);
    res.json(cats);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.post('/quiz/:id/round/:roundNr/categories', async (req, res) => {
  try {
    const round = await api.startRound(req.params.id, req.params.roundNr, req.body.ids);
    console.log(round);
    res.json(round);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/quiz', async (req, res) => {
  try {
    const quiz = await api.findQuizs();
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/quiz/open', async (req, res) => {
  try {
    const quiz = await api.getOpenQuizs();
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.post('/quiz/:id/close', async (req, res) => {
  try {
    const quiz = await api.closeQuiz(req.params.id);
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.post('/quiz', async (req, res) => {
  console.log(req.body);
  try {
    const quiz = await api.createQuiz(req.body);
    console.log(quiz);
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 409);
  }
});

app.get('/quiz/:id', async (req, res) => {
  try {
    const quiz = await api.findQuiz(req.params.id);
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.post('/quiz/:id/pass', async (req, res) => {
  try {
    const valid = await api.checkPass(req.params.id, req.body.pass);
    console.log('Password valid:');
    console.log(valid);
    if (valid) {
      res.status(200).send();
    }
    res.status(201).send();
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/quiz/:id/teams', async (req, res) => {
  try {
    const teams = await api.getTeams(req.params.id);
    console.log('Get Teams data:');
    console.log(teams);
    res.status(200).json(teams);
  } catch (err) {
    handleError(res, err.message, 409);
  }
});

app.get('/quiz/:id/team/:teamId', async (req, res) => {
  try {
    const team = await api.getTeam(req.params.id, req.params.teamId);
    console.log('Get Team data:');
    console.log(team);
    res.status(200).json(team);
  } catch (err) {
    handleError(res, err.message, 409);
  }
});

app.delete('/quiz/:id/team/:teamId', async (req, res) => {
  try {
    const team = await api.deleteTeam(req.params.id, req.params.teamId);
    console.log('Get Team data:');
    console.log(team);
    res.status(200).json(team);
  } catch (err) {
    handleError(res, err.message, 409);
  }
});

app.post('/quiz/:id/team', async (req, res) => {
  try {
    const quiz = await api.joinQuiz(req.params.id, req.body.team);
    console.log('Post Team data:');
    console.log(quiz);
    res.status(200).json(quiz);
  } catch (err) {
    handleError(res, err.message, 409);
  }
});

app.post('/quiz/:id/team/:teamId', async (req, res) => {
  try {
    const quiz = await api.removeTeam(req.params.id, req.params.teamId);
    console.log(quiz);
    res.json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/questions', async (req, res) => {
  try {
    const questions = await api.getAllQuestions();
    res.json({
      original: vragen.length,
      count: questions.length,
      questions
    });
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/questions/random/*', async (req, res) => {
  try {
    console.log('Fetching random questions.');
    console.log(req.params);
    const categoryIds = req.params[0].split('/');
    const questions = await api.getRandomQuestions(categoryIds);
    res.json(questions);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.get('/quiz/:quizId/startRound', async (req, res) => {
  try {
    const round = await api.startNextRound(req.params.quizId);
    res.status(200).json(round);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

// TODO: Get question from round instead of Questions
app.get('/question/:id', async (req, res) => {
  try {
    const question = await api.getQuestion(req.params.id);
    res.json(question);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

// TODO: Fix function calls!
app.post('/quiz/:quizId/round/:roundNr/question/:id', async (req, res) => {
  try {
    const round = await api.setCurrentQuestion(
      req.params.quizId,
      req.params.roundNr,
      req.params.id
    );
    res.json(round);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

// TODO: Fix function calls!
app.post('/quiz/:quizId/round/:roundNr/question/close', async (req, res) => {
  try {
    const quiz = await api.closeQuestion(req.params.quizId, req.params.roundNr, req.body);
    res.status(200).json(quiz);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

// TODO: Fix function calls!
app.get('/answer/:id', async (req, res) => {
  try {
    const answer = await api.getAnswer(req.params.id);
    res.status(200).json(answer);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

// TODO: Fix function calls!
app.post(
  '/quiz/:quizId/round/:roundNr/question/:questionId/team/:teamId/answer',
  async (req, res) => {
    try {
      const answer = await api.saveAnswer(
        req.params.quizId,
        req.params.roundId,
        req.params.questionId,
        req.params.teamId,
        req.body.answer
      );
      res.status(200).json(answer);
    } catch (err) {
      handleError(res, err.message, 404);
    }
  }
);

// TODO: Fix function calls!
app.post('/answer/:id', async (req, res) => {
  try {
    const answer = await api.updateAnswer(req.params.id, req.body.answer);
    res.status(200).json(answer);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});

app.post('/quiz/:quizId/nextRound', async (req, res) => {
  try {
    const round = await api.startNextRound(req.params.quizId);
    res.json(round);
  } catch (err) {
    handleError(res, err.message, 404);
  }
});
