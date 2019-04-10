import React, { useEffect, useReducer, Fragment } from 'react';
import { PrepareGame } from './PrepareGame';
import { Team } from './Team';
import { PrepareRound } from './PrepareRound';
import { PrepareQuestion } from './PrepareQuestion';
import { Question } from './Question';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import { Redirect } from 'react-router';
import Button from 'reactstrap/lib/Button';
import {
  GameStates,
  QuestionModel,
  TeamModel,
} from '../../quizzmaster/components/HostGame';
import { ChangeTeamName } from './ChangeTeamName';
import { QuestionJudging } from './QuestionJudging';
import { EndOfRound } from './EndOfRound';
import { StopGame } from '../../shared/components/StopGame';

class GameState extends GameStates {
  static readonly showRooms = 'showRooms';
  static readonly nameClash = 'nameClash';
}

enum ReducerActionTypes {
  quizClosed,
  quizJoined,
  teamJoined,
  teamRemoval,
  criticalError,
  gameStateChange,
  nameClash,
  changeTeamName,
  questionSelected,
  saveAnswer,
  answerJudged,
  questionReceived,
  addScores,
  newRound,
  poked,
  leaveQuiz,
}

interface GameProps {
  team: Team;
  gameId?: string;
  password: string;
  onDisconnect: (reason: string) => void;
}

export interface TeamWithId extends Team {
  _id: string;
  score: number;
}

export interface GameInfoModel {
  _id: string;
  name: string;
  round: number;
  currentQuestion?: {
    _id: string;
    question: string;
    answer: string;
    category: string;
  };
  teams: TeamModel[];
  answer?: AnswerModel;
  poke: string;
}

export interface AnswerModel {
  _id: string;
  teamId: string;
  questionId: string;
  answer: string;
  correct: boolean;
  _version: number;
  judged: boolean;
}

export interface ReducerModel {
  quiz: GameInfoModel;
  ownTeam: TeamWithId;
  gameState: GameState;
  error: string;
}

export interface ReducerActions {
  type: ReducerActionTypes;
  payload: any;
}

function wsReducer(state: ReducerModel, action: ReducerActions) {
  switch (action.type) {
    case ReducerActionTypes.quizClosed:
      return {
        ...state,
        gameState: GameState.disconnect,
      };
    case ReducerActionTypes.quizJoined:
      // TODO: Change quiz to specific types, because it will override currentQuestion like this.
      return {
        ...state,
        quiz: {
          ...state.quiz,
          name: action.payload.quiz.name,
          teams: action.payload.quiz.teams,
          _id: action.payload.quiz._id,
        },
        ownTeam: action.payload.ownTeam,
        gameState: GameState.preparingQuiz,
      };
    case ReducerActionTypes.nameClash:
      return {
        ...state,
        gameState: GameState.nameClash,
      };
    case ReducerActionTypes.changeTeamName:
      return {
        ...state,
        ownTeam: {
          ...state.ownTeam,
          name: action.payload,
        },
        gameState: GameState.loading,
      };
    case ReducerActionTypes.teamJoined: {
      const quiz = { ...state.quiz };
      const exists = quiz.teams.find(
        (teamFind) => teamFind.name === action.payload.team.name,
      );
      if (!exists) quiz.teams.push(action.payload.team);
      return {
        ...state,
        quiz,
      };
    }
    case ReducerActionTypes.teamRemoval: {
      if (action.payload === state.ownTeam._id) {
        return {
          ...state,
          error: `You've been kicked from the game :( `,
          gameState: GameState.disconnect,
        };
      } else {
        return {
          ...state,
          quiz: {
            ...state.quiz,
            teams: state.quiz.teams.filter(
              (team) => team._id !== action.payload,
            ),
          },
        };
      }
    }
    case ReducerActionTypes.newRound: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          round: action.payload,
        },
        gameState: GameState.selectQuestion,
      };
    }
    case ReducerActionTypes.gameStateChange: {
      return {
        ...state,
        gameState: action.payload,
      };
    }
    case ReducerActionTypes.questionSelected: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          currentQuestion: {
            _id: action.payload,
            answer: 'No question set yet.',
            question: 'No question set yet.',
            category: 'No question set yet.',
          },
          poke: '',
        },
        gameState: GameState.questionTime,
      };
    }
    case ReducerActionTypes.questionReceived: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          currentQuestion: action.payload,
        },
        gameState: GameState.questionTime,
      };
    }
    case ReducerActionTypes.saveAnswer: {
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answer: {
            ...action.payload,
            judged: false,
          },
          poke: '',
        },
      };
    }
    case ReducerActionTypes.poked: {
      if (action.payload.teamId !== state.ownTeam._id) {
        return state;
      }
      return {
        ...state,
        quiz: {
          ...state.quiz,
          poke: action.payload.poke,
        },
      };
    }
    case ReducerActionTypes.answerJudged: {
      console.log('Own team judged?');
      console.log(action.payload.teamId === state.ownTeam._id);
      return action.payload.teamId === state.ownTeam._id
        ? {
            ...state,
            quiz: {
              ...state.quiz,
              answer: {
                ...action.payload.answer,
                judged: true,
              },
            },
          }
        : state;
    }
    case ReducerActionTypes.addScores: {
      const teams = state.quiz.teams.map((team) => {
        const teamScore = action.payload.find(
          (score: any) => score._id === team._id,
        );
        if (teamScore) {
          team.score = teamScore.score;
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
    case ReducerActionTypes.leaveQuiz: {
      return {
        ...state,
        gameState: GameState.disconnect,
      };
    }
    case ReducerActionTypes.criticalError: {
      try {
        return {
          ...state,
          error: action.payload,
          gameState: GameState.disconnect,
        };
      } catch (err) {
        console.log('An error occured when updating state');
        console.log(err);
      }
    }
    default:
      // A reducer must always return a valid state.
      // Alternatively you can throw an error if an invalid action is dispatched.
      return state;
  }
}

export const TeamGame: React.FunctionComponent<GameProps> = (props) => {
  // No GameId was given, so can't fetch data for a game. Return Error message in that case.
  if (props.gameId == null) {
    return (
      <div>
        No Game information available, please join a different game or try
        again.
      </div>
    );
  }

  const [state, dispatch] = useReducer<ReducerModel, ReducerActions>(
    wsReducer,
    {
      quiz: {
        _id: props.gameId,
        name: '',
        round: 1,
        teams: [],
        answer: undefined,
        poke: '',
      },
      ownTeam: {
        _id: '',
        name: props.team.name,
        members: props.team.members,
        score: 0,
      },
      gameState: GameState.preparingQuiz,
      error: '',
    },
  );

  useEffect(() => {
    let unmounted = false;
    if (props.gameId != null) {
      // TODO: This is the wrong action and state for closing the game and returning to mainpage.
      try {
        QuizzDataHandler.connect();
        QuizzDataHandler.joinQuiz(
          props.gameId,
          props.password,
          props.team,
          (response, ownTeam) => {
            console.log('Joined quiz:');
            console.log(response);
            if (!unmounted) {
              dispatch({
                type: ReducerActionTypes.quizJoined,
                payload: {
                  quiz: response,
                  ownTeam: ownTeam,
                },
              });
            }
          },
          (err) => {
            props.onDisconnect(
              'Someone in the quizz is already using that team name.',
            );
            if (!unmounted) {
              dispatch({
                type: ReducerActionTypes.nameClash,
                payload: GameState.nameClash,
              });
            }
          },
        );
        QuizzDataHandler.onQuizClose(() => {
          console.log('Quiz disconnected.');
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.quizClosed,
              payload: GameState.disconnect,
            });
          }
        });
        QuizzDataHandler.onTeamJoin((team) => {
          console.log(team);
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.teamJoined,
              payload: { team: team, ownTeamName: props.team.name },
            });
          }
        });
        QuizzDataHandler.onTeamLeft((id) => {
          console.log('On team left response');
          console.log(id);
          if (!unmounted) {
            dispatch({ type: ReducerActionTypes.teamRemoval, payload: id });
          }
        });
        QuizzDataHandler.onTeamKick((id) => {
          console.log('On team kicked response');
          console.log(id);
          if (!unmounted) {
            dispatch({ type: ReducerActionTypes.teamRemoval, payload: id });
          }
        });
        QuizzDataHandler.onGameStateChange((gameState) => {
          console.log('New game state');
          console.log(gameState);
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.gameStateChange,
              payload: gameState,
            });
          }
        });
        QuizzDataHandler.onQuestionSelected((questionId) => {
          console.log('New question');
          console.log(questionId);
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.questionSelected,
              payload: questionId,
            });
          }
        });
        QuizzDataHandler.onPoke((poke) => {
          console.log('New poke');
          console.log(poke);
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.poked,
              payload: poke,
            });
          }
        });
        QuizzDataHandler.onAnswerJudged((answer) => {
          console.log('Answer judged');
          console.log(answer);
          if (!unmounted) {
            console.log('Answer judged is for this team.');
            dispatch({
              type: ReducerActionTypes.answerJudged,
              payload: answer,
            });
          }
        });
        QuizzDataHandler.onNewRound((roundNr) => {
          console.log('Next round');
          console.log(roundNr);
          if (!unmounted) {
            console.log('A new round is started.');
            dispatch({
              type: ReducerActionTypes.newRound,
              payload: roundNr,
            });
          }
        });
        QuizzDataHandler.onDisconnect(() => {
          if (!unmounted) {
            dispatch({
              type: ReducerActionTypes.criticalError,
              payload: 'It seems we disconnected.',
            });
          }
        });
      } catch (err) {
        console.log('An error occured when joining quiz.');
        if (!unmounted) {
          dispatch({
            type: ReducerActionTypes.criticalError,
            payload: 'An error occured when joining quiz.',
          });
        }
        // setError(err.message);
      }
    } else {
      // setError('No gameID found to connect to. Please retry.');
      if (!unmounted) {
        dispatch({
          type: ReducerActionTypes.criticalError,
          payload: 'No gameID found to connect to. Please retry.',
        });
      }
    }

    return () => {
      unmounted = true;
      console.log('Leaving game.');
      try {
        QuizzDataHandler.closeConnection();
        // TODO: Return to homescreen. If error, sudden DC, show error.
      } catch (err) {
        console.log(err);
      }
    };
  }, [props.gameId]);

  const retryToJoin = (name: string) => {
    dispatch({
      type: ReducerActionTypes.changeTeamName,
      payload: name,
    });

    QuizzDataHandler.joinQuiz(
      state.quiz._id,
      props.password,
      { name: name, members: props.team.members },
      (response, ownTeam) => {
        console.log('Joined quiz:');
        console.log(response);
        props.onDisconnect('');
        dispatch({
          type: ReducerActionTypes.quizJoined,
          payload: {
            quiz: response,
            ownTeam: ownTeam,
          },
        });
      },
      (err) => {
        props.onDisconnect(
          'Someone in the quizz is already using that team name.',
        );
        dispatch({
          type: ReducerActionTypes.nameClash,
          payload: GameState.nameClash,
        });
      },
    );
  };

  const leaveQuiz = () => {
    const team = state.quiz.teams.find(
      (teamFind) => teamFind.name === props.team.name,
    );
    const teamId = team ? team._id : '';
    try {
      QuizzDataHandler.leaveQuiz(
        state.quiz._id,
        teamId,
        () => console.log('Something happened when removing a team.'),
        () => {
          console.log('Succesfully removed a team!');
          dispatch({
            type: ReducerActionTypes.quizClosed,
            payload: '',
          });
        },
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  const updateQuestion = (question: QuestionModel) => {
    dispatch({
      type: ReducerActionTypes.questionReceived,
      payload: question,
    });
  };

  const sendAnswer = (questionId: string, answer: string) => {
    if (answer !== '') {
      QuizzDataHandler.saveAnswer(
        state.quiz.round,
        questionId,
        answer,
        (err) => {
          console.log('Something happened when saving the answer.');
          console.log(err);
        },
        (answer) => {
          dispatch({
            type: ReducerActionTypes.saveAnswer,
            payload: answer,
          });
          console.log('Successfully saved an answer.');
        },
      );
      console.log(answer);
    } else {
      console.log('Given answer is empty.');
    }
  };

  const updateAnswer = (questionId: string, answer: string) => {
    if (
      state.quiz.answer &&
      answer !== '' &&
      answer !== state.quiz.answer.answer
    ) {
      QuizzDataHandler.updateAnswer(
        state.quiz.answer._id,
        answer,
        (err) => console.log('Something happened when saving the answer.'),
        (answer) => {
          dispatch({
            type: ReducerActionTypes.saveAnswer,
            payload: answer,
          });
          console.log('Successfully saved an answer.');
        },
      );
      console.log(answer);
    } else {
      console.log(
        'No answer._id available for updating the answer or given answer is equal to previous answer or empty.',
      );
    }
  };

  const addRoundScoreToTotalScore = (scores: TeamWithId[]) => {
    dispatch({
      type: ReducerActionTypes.addScores,
      payload: scores,
    });
  };

  {
    switch (state.gameState) {
      case GameState.loading: {
        return <div>Loading game info..</div>;
      }
      case GameState.disconnect: {
        props.onDisconnect(state.error);
        return <Redirect to="/" />;
      }
      case GameState.nameClash:
        return (
          <ChangeTeamName
            teamName={state.ownTeam.name}
            changeName={(name) => retryToJoin(name)}
          />
        );
      case GameState.preparingQuiz:
        return <PrepareGame teams={state.quiz.teams} leaveQuiz={leaveQuiz} />;
      case GameState.prepareRound:
        return <PrepareRound />;
      case GameState.selectQuestion:
        return <PrepareQuestion />;
      case GameState.questionTime:
        return (
          <Question
            questionReceived={(question) => updateQuestion(question)}
            question={state.quiz.currentQuestion}
            poke={state.quiz.poke}
            sendAnswer={(questionId, answer) => sendAnswer(questionId, answer)}
            sendUpdate={(questionId, answer) =>
              updateAnswer(questionId, answer)
            }
          />
        );
      case GameState.questionJudging:
        if (!state.quiz.currentQuestion) {
          return (
            <div>
              {
                'Seems something went wrong checking for the current Question :('
              }
            </div>
          );
        } else {
          return (
            <QuestionJudging
              question={state.quiz.currentQuestion!}
              teamAnswer={state.quiz.answer}
            />
          );
        }
      case GameState.closeRound:
        return (
          <EndOfRound
            teams={state.quiz.teams}
            ownTeam={state.ownTeam}
            roundNr={state.quiz.round}
            addRoundScoreToScore={(scores) => addRoundScoreToTotalScore(scores)}
          />
        );
      case GameState.stopQuiz:
        return (
          <StopGame
            teams={state.quiz.teams}
            close={() =>
              dispatch({ type: ReducerActionTypes.leaveQuiz, payload: null })
            }
          />
        );
      default:
        return <p>404 GameState not found. Please return to Room Selection.</p>;
    }
  }
};
