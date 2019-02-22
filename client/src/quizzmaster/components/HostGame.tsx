import React, {
  FunctionComponent,
  useState,
  useEffect,
  useReducer,
  Fragment,
} from 'react';
import { QuizModel } from './Host';
import { PrepareQuiz } from './PrepareQuiz';
import { StopGame } from '../../shared/components/StopGame';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import { PrepareRound } from './PrepareRound';
import { SelectQuestion } from './SelectQuestion';
import { QuestionAnswering } from './QuestionAnswering';
import { QuestionJudging } from './QuestionJudging';
import { CloseRound } from './CloseRound';
import { QuizOverview } from './QuizOverview';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';

interface HostGameProps {
  quiz: QuizModel;
  onDisconnect: (reason: string) => void;
}

interface GameDataModel {
  _id: string;
  name: string;
  teams: TeamModel[];
  round: RoundModel;
  quizStarted: boolean;
  maxNQuestionsPerRound: number;
  currentQuestion?: QuestionModel;
  selectedCategories: CategoryModel[];
}

interface RoundModel {
  nr: number;
  questions: QuestionModel[];
}

export interface QuestionModel {
  _id: string;
  question: string;
  answer: string;
  category: {
    _id: string;
    category: string;
  };
}

export interface TeamModel {
  _id: string;
  name: string;
  members: string[];
  answer: {
    _id: string;
    teamId: string;
    questionId: string;
    value: string;
    correct: boolean;
    _version: number;
    judged: boolean;
  };
  score: number;
  roundScore: number;
}

export interface CategoryModel {
  _id: string;
  category: string;
}

// export interface TeamAnswerModel {
//   teamId: string;
//   answer: string;
//   version: number;
// }

export class GameStates {
  static readonly preparingQuiz = 'preparingQuiz';
  static readonly prepareRound = 'prepareRound';
  static readonly selectQuestion = 'selectQuestion';
  static readonly questionTime = 'questionTime';
  static readonly closeQuestion = 'closeQuestion';
  static readonly closeRound = 'closeRound';
  static readonly closeGame = 'closeGame';
  static readonly stopQuiz = 'stopQuiz';
  static readonly disconnect = 'disconnect';
  static readonly loading = 'loading';
  static readonly questionJudging = 'questionJudging';
}

// export enum GameStates {
//   preparingQuiz,
//   prepareRound,
//   selectQuestion,
//   questionTime,
//   closeQuestion,
//   closeRound,
//   closeGame,
//   disconnect,
// }

export interface ReducerModel {
  quiz: GameDataModel;
  availableCategories: CategoryModel[];
  gameState: GameStates;
}

export interface ReducerActions {
  type: ReducerActionTypes;
  payload: any;
}

enum ReducerActionTypes {
  quizCreated,
  quizClosed,
  teamJoined,
  teamLeft,
  startQuiz,
  newCategories,
  startRound,
  startQuestion,
  closeQuestion,
  answerReceived,
  answerJudged,
  selectQuestion,
  endRound,
  endQuiz,
  decideAnswer,
  prepareRound,
  roundScores,
}

function wsReducer(state: ReducerModel, action: ReducerActions) {
  switch (action.type) {
    case ReducerActionTypes.quizCreated: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          _id: action.payload._id,
          name: action.payload.name,
          teams: action.payload.teams,
          round: state.quiz.round,
          // round: action.payload.currentRound,
        },
      };
    }
    case ReducerActionTypes.quizClosed:
      return {
        ...state,
        gameState: action.payload,
      };
    case ReducerActionTypes.teamJoined:
      const quiz = { ...state.quiz };
      quiz.teams.push({
        ...action.payload,
        answer: {
          value: '',
          correct: false,
          version: 1,
          judged: false,
        },
        score: 0,
        roundScore: 0,
      });
      return {
        ...state,
        quiz,
      };
    case ReducerActionTypes.teamLeft: {
      console.log('Someone left');
      console.log(state.quiz.teams);
      const index = state.quiz.teams.findIndex(
        (team) => team._id === action.payload,
      );
      console.log(index);
      const quiz = { ...state.quiz };
      if (index >= 0) quiz.teams.splice(index, 1);

      return {
        ...state,
        quiz,
      };
    }
    case ReducerActionTypes.startQuiz: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          quizStarted: true,
        },
        gameState: GameStates.prepareRound,
      };
    }
    case ReducerActionTypes.newCategories:
      return {
        ...state,
        availableCategories: action.payload,
      };
    case ReducerActionTypes.prepareRound:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          round: {
            nr: state.quiz.round.nr + 1,
            questions: [],
          },
        },
        gameState: GameStates.prepareRound,
      };
    case ReducerActionTypes.startRound:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          selectedCategories: action.payload,
        },
        gameState: GameStates.selectQuestion,
      };
    case ReducerActionTypes.selectQuestion:
      return {
        ...state,
        gameState: GameStates.selectQuestion,
      };
    case ReducerActionTypes.startQuestion:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          round: {
            ...state.quiz.round,
            questions: [...state.quiz.round.questions, action.payload],
          },
          currentQuestion: action.payload,
        },
        gameState: GameStates.questionTime,
      };
    case ReducerActionTypes.answerReceived: {
      const quiz = { ...state.quiz };
      const team = quiz.teams.find(
        (team) => team._id === action.payload.teamId,
      );
      // TODO: Check for versionnumber to see if old answer was arrived later than new answer.
      if (team) {
        team.answer = {
          ...action.payload,
          value: action.payload.answer,
          judged: false,
        };
      }
      return {
        ...state,
        quiz: quiz,
      };
    }
    case ReducerActionTypes.closeQuestion:
      if (state.quiz.currentQuestion) {
        return {
          ...state,
          gameState: GameStates.questionJudging,
        };
      } else {
        return {
          ...state,
          gameState: GameStates.questionJudging,
        };
      }
    case ReducerActionTypes.decideAnswer: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          teams: state.quiz.teams.map((team) => {
            if (team._id === action.payload.teamId) {
              team.answer.correct = action.payload.correct;
              team.answer.judged = true;
            }
            return team;
          }),
        },
      };
    }
    case ReducerActionTypes.roundScores: {
      const teams = state.quiz.teams.map((team) => {
        const teamScore = action.payload.teamScores.find(
          (score: any) => score.teamId === team._id,
        );
        if (teamScore) {
          team.roundScore = teamScore.score;
          team.score += teamScore.score;
        }
        return team;
      });

      return {
        ...state,
        quiz: {
          ...state.quiz,
          teams: teams,
        },
      };
    }
    case ReducerActionTypes.endRound: {
      return {
        ...state,
        gameState: GameStates.closeRound,
      };
    }
    case ReducerActionTypes.endQuiz: {
      return {
        ...state,
        gameState: GameStates.stopQuiz,
      };
    }
    default:
      // A reducer must always return a valid state.
      // Alternatively you can throw an error if an invalid action is dispatched.
      return state;
  }
}

export const HostGame: FunctionComponent<HostGameProps> = (props) => {
  const [error, setError] = useState('');
  const [state, dispatch] = useReducer<ReducerModel, ReducerActions>(
    wsReducer,
    {
      quiz: {
        _id: '',
        name: props.quiz.name,
        quizStarted: false,
        selectedCategories: [],
        currentQuestion: undefined,
        maxNQuestionsPerRound: props.quiz.maxNQuestions,
        round: {
          nr: 1,
          questions: new Array<QuestionModel>(),
        },
        teams: [],
      },
      availableCategories: [],
      gameState: GameStates.preparingQuiz,
    },
  );

  useEffect(() => {
    let unmounted = false;
    console.log('Created a new datahandler api.');
    try {
      QuizzDataHandler.connect();
      QuizzDataHandler.hostGame(props.quiz, (quiz) => {
        console.log('Successfully created a room.');
        if (!unmounted) {
          dispatch({ type: ReducerActionTypes.quizCreated, payload: quiz });
        }
      }); // TODO: Send quiz information to this call and let it handle saving to db and create a host on the ws server.
      QuizzDataHandler.onTeamJoin((data) => {
        console.log('On team join response');
        console.log(data);
        if (!unmounted) {
          dispatch({ type: ReducerActionTypes.teamJoined, payload: data });
        }
      });
      QuizzDataHandler.onTeamLeft((id) => {
        console.log('On team left response');
        console.log(id);
        if (!unmounted) {
          dispatch({ type: ReducerActionTypes.teamLeft, payload: id });
        }
      });
      QuizzDataHandler.onTeamKick((id) => {
        console.log('On team kick response');
        console.log(id);
        if (!unmounted) {
          dispatch({ type: ReducerActionTypes.teamLeft, payload: id });
        }
      });
      QuizzDataHandler.onAnswer((answerId) => {
        console.log('On team answer response');
        console.log(answerId);
        getTeamAnswer(answerId);
      });
      // TODO: Create Data Handler for stop hosting, so it does not count as a disconnect.
      QuizzDataHandler.onDisconnect(() => {
        props.onDisconnect('Game got disconnected from the server :( ');
        if (!unmounted) {
          dispatch({
            type: ReducerActionTypes.quizClosed,
            payload: GameStates.disconnect,
          });
        }
      });
    } catch (err) {
      setError(err.message);
    }
    return () => {
      unmounted = true;
      try {
        QuizzDataHandler.disconnectGame();
      } catch (err) {
        console.log(err);
      }
    };
  }, [props.quiz.name]);

  // Responsible for fetching data after gameState change. Required for rendering of component and afterwards fetching the required data.
  useEffect(() => {
    // Be aware of no socket connection. Different useeffect with no connect call. At the moment no socket connection is required for these fetches.
    // But be mindful that this can change in the future.
    // TODO: Get rid of this and place it in the PrepareRound component. Even though that component gets connection stuff, there's too much happening here.
    try {
      switch (state.gameState) {
        case GameStates.prepareRound: {
          if (state.availableCategories.length <= 0) {
            QuizzDataHandler.fetchCategories(
              (err) => {
                console.log(
                  'Something bad happened while fetching categories.',
                );
                console.log(err);
              },
              (categories) => {
                console.log('Succesfully fetched categories');
                dispatch({
                  type: ReducerActionTypes.newCategories,
                  payload: categories,
                });
              },
            );
          }

          break;
        }
        case GameStates.selectQuestion: {
          // fetchNewRandomQuestions();
          break;
        }
      }
    } catch (err) {
      console.log(
        'Something bad happened inside the useeffect for fetching data on state change',
      );
      console.log(err);
    }
    return () => {
      console.log('State has changed.');
    };
  }, [state.gameState]);

  const closeGame = () => {
    console.log('Game completely ended.');
  };

  const removeTeam = (team: TeamModel) => {
    QuizzDataHandler.removeTeam(
      state.quiz._id,
      team._id,
      () => console.log('Something happened when removing a team.'),
      () => console.log('Succesfully removed a team!'),
    );
  };

  const startQuiz = () => {
    console.log('Starting quiz.');
    QuizzDataHandler.startQuiz(
      (err) => console.log(err),
      () => {
        dispatch({
          type: ReducerActionTypes.startQuiz,
          payload: null,
        });
      },
    );
  };

  const setCategories = (categories: CategoryModel[]) => {
    console.log('Categories received!');
    console.log(categories);
    QuizzDataHandler.startRound(
      state.quiz.round.nr,
      categories.map((category) => category._id),
      (err) => console.log(err),
      () => {
        dispatch({
          type: ReducerActionTypes.startRound,
          payload: categories,
        });
      },
    );
  };

  const setQuestion = (question: QuestionModel) => {
    console.log('Question selected!');
    console.log(question);
    QuizzDataHandler.startQuestion(
      question._id,
      state.quiz.round.nr,
      (err) => console.log(err),
      () => {
        dispatch({ type: ReducerActionTypes.startQuestion, payload: question });
      },
    );
  };

  const getTeamAnswer = (answerId: string) => {
    QuizzDataHandler.getAnswer(
      answerId,
      (err) => console.log(err),
      (answer) => {
        console.log(answer);
        dispatch({
          type: ReducerActionTypes.answerReceived,
          payload: answer,
        });
      },
    );
  };

  // TODO: Make this compatible with emoji's and text
  // https://github.com/missive/emoji-mart
  // https://medium.com/@seanmcp/%EF%B8%8F-how-to-use-emojis-in-react-d23bbf608bf7
  const annoyTeam = (annoyance: string, teamId: string) => {
    console.log(`Annoyed a team: ${teamId}, with ${annoyance}`);
    QuizzDataHandler.pokeTeam(
      teamId,
      annoyance,
      (err) => console.log(err),
      () => {
        console.log(`Successfully annoyed a team: ${teamId}`);
      },
    );
  };

  const closeQuestion = () => {
    console.log('Closed a question.');
    QuizzDataHandler.closeQuestion(
      (err) => console.log(err),
      () => {
        dispatch({
          type: ReducerActionTypes.closeQuestion,
          payload: null,
        });
      },
    );
  };

  const nextQuestion = () => {
    // TODO: Send teamId's of teams that gave correct answer to the backend to update their score.
    QuizzDataHandler.selectingNewQuestion(
      (err) => console.log(err),
      () => {
        console.log('Next question!');
        dispatch({
          type: ReducerActionTypes.selectQuestion,
          payload: null,
        });
      },
    );
  };

  const endRound = () => {
    // TODO: Send teamId's of teams that gave correct answer to the backend to update their score.
    // TODO: After receiving correct saved, send message to teams to retrieve the scores to show end of round results and therefor ending the round.
    // TODO: After sending the message, end the round.
    QuizzDataHandler.calculateTeamScores(
      state.quiz.round.nr,
      (err: string) => console.log(err),
      (
        scores: [
          { teamId: string; totalCorrectAnswers: number; score: number }
        ],
      ) => {
        dispatch({
          type: ReducerActionTypes.roundScores,
          payload: scores,
        });

        // Scores for the round calculated and saved into the DB. Notify teams that the round is being closed.
        QuizzDataHandler.endRound(
          (err) => console.log(err),
          () => {
            console.log('Ended the round.');
            dispatch({
              type: ReducerActionTypes.endRound,
              payload: null,
            });
          },
        );
      },
    );
    // QuizzDataHandler.getTeamsRoundScores(
    //   state.quiz.round.nr,
    //   (err: string) => console.log(err),
    //   (
    //     scores: [
    //       { teamId: string; totalCorrectAnswers: number; score: number }
    //     ],
    //   ) => {
    //     dispatch({
    //       type: ReducerActionTypes.roundScores,
    //       payload: scores,
    //     });
    //     // setTeamRoundScore(scores);
    //   },
    // );
  };

  const setAnswerCorrectness = (
    teamId: string,
    answerId: string,
    correct: boolean,
  ) => {
    console.log(`Setting answer correctness: ${teamId}`);
    console.log(`Setting answer correctness: ${answerId}`);
    QuizzDataHandler.setAnswerCorrectness(
      teamId,
      answerId,
      correct,
      (err) => console.log(err),
      () => {
        dispatch({
          type: ReducerActionTypes.decideAnswer,
          payload: { teamId, correct },
        });
      },
    );
  };

  const startRound = () => {
    dispatch({
      type: ReducerActionTypes.prepareRound,
      payload: null,
    });
  };

  // TODO: Finish this function to close the quiz and show end results. No functions yet to notify others that the quiz has come to its end.
  const stopQuiz = () => {
    QuizzDataHandler.stopQuiz(
      (err) => console.log(err),
      () => {
        dispatch({
          type: ReducerActionTypes.endQuiz,
          payload: null,
        });
      },
    );
    console.log('Stop the quiz!');
  };

  // TODO: This is a harsh way to handle errors. Check for the ability to resend a message when something on the websocket happened for example.
  // Might be fixed with the introduction of types of errors. Like send-type error and disconnect-type error.
  if (error) {
    return (
      <div>
        <p>Something bad happend..</p>
        <p>Reason: </p>
        <p>{error}</p>
      </div>
    );
  }

  const renderViewBasedOnGameState = () => {
    switch (state.gameState) {
      case GameStates.disconnect: {
        return <Redirect to="/" />;
      }
      case GameStates.preparingQuiz:
        return (
          <Fragment>
            <Link to="/">
              <Button color="danger" block>
                Stop hosting
              </Button>
            </Link>
            <PrepareQuiz
              teams={state.quiz.teams}
              addTeam={() =>
                console.log('Add team.')
              } /* TODO: Change to proper function. */
              removeTeam={(team) => removeTeam(team)}
              startQuiz={() => startQuiz()}
            />
          </Fragment>
        );
      case GameStates.prepareRound:
        return (
          <PrepareRound
            categories={state.availableCategories}
            setCategories={(categories: CategoryModel[]) =>
              setCategories(categories)
            }
          />
        );
      case GameStates.selectQuestion:
        console.log(state.quiz);
        return (
          <SelectQuestion
            unavailableQuestions={state.quiz.round.questions}
            categories={state.quiz.selectedCategories}
            selectQuestion={(question: QuestionModel) => setQuestion(question)}
          />
        );
      case GameStates.questionTime:
        return (
          <QuestionAnswering
            teams={state.quiz.teams}
            question={state.quiz.currentQuestion}
            annoyTeam={(annoyance: any, teamId: string) =>
              annoyTeam(annoyance, teamId)
            }
            closeQuestion={() => closeQuestion()}
          />
        );
      case GameStates.questionJudging:
        return (
          <QuestionJudging
            teams={state.quiz.teams}
            question={state.quiz.currentQuestion}
            endOfRound={
              state.quiz.round.questions.length >=
              state.quiz.maxNQuestionsPerRound
            }
            endRound={() => endRound()}
            nextQuestion={() => nextQuestion()}
            setIncorrect={(teamId, answerId) =>
              setAnswerCorrectness(teamId, answerId, false)
            }
            setCorrect={(teamId, answerId) =>
              setAnswerCorrectness(teamId, answerId, true)
            }
          />
        );
      // // TODO: Decide when to show team stats, like scores and such.
      case GameStates.closeRound:
        return (
          <CloseRound
            roundNr={state.quiz.round.nr}
            teams={state.quiz.teams}
            continuePlaying={() => startRound()}
            stopPlaying={() => stopQuiz()}
          />
        );
      case GameStates.stopQuiz:
        return <StopGame teams={state.quiz.teams} close={() => closeGame()} />;
      default:
        return <p>Something went wrong, please retry to host a game.</p>;
    }
  };

  if (!state.quiz.quizStarted) {
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            {renderViewBasedOnGameState()}
          </Col>
        </Row>
      </Container>
    );
  } else {
    return (
      <Container>
        <Row>
          <Col
            lg={{ size: 2 }}
            md={{ size: 2 }}
            style={{ borderRight: '1px solid darkgrey' }}
          >
            <QuizOverview
              roundNr={state.quiz.round.nr}
              categories={state.quiz.selectedCategories}
              maxNQuestions={state.quiz.maxNQuestionsPerRound}
              questions={state.quiz.round.questions}
              teams={state.quiz.teams}
            />
          </Col>
          <Col
            lg={{ size: 8, offset: 1 }}
            md={{ size: 8, offset: 1 }}
            sm={{ size: 12 }}
          >
            {renderViewBasedOnGameState()}
          </Col>
        </Row>
      </Container>
    );
  }
};
