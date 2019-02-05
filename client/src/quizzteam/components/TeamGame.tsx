import React, { useEffect, useReducer, Fragment } from 'react';
import { PrepareGame } from './PrepareGame';
import { Team } from './Team';
import { PrepareRound } from './PrepareRound';
import { PrepareQuestion } from './PrepareQuestion';
import { Question } from './Question';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import { Redirect } from 'react-router';
import Button from 'reactstrap/lib/Button';
import { GameStates } from '../../quizzmaster/components/HostGame';
import { ChangeTeamName } from './ChangeTeamName';

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
}

interface GameProps {
  team: Team;
  gameId?: string;
  onDisconnect: (reason: string) => void;
}

interface TeamWithId extends Team {
  _id: string;
}

export interface GameInfoModel {
  _id: string;
  name: string;
  round: number;
  currentQuestion?: {
    _id: string;
    question: string;
    category: string;
  };
  teams: TeamWithId[];
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
          round: state.quiz.round,
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
            question: 'No question set yet.',
            category: 'No question set yet.',
          },
        },
        gameState: GameState.questionTime,
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
      },
      ownTeam: {
        _id: '',
        name: props.team.name,
        members: props.team.members,
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

  const sendAnswer = (questionId: string, answer: string) => {
    QuizzDataHandler.saveAnswer(
      answer,
      (err) => console.log('Something happened when saving the answer.'),
      () => {
        console.log('Successfully saved an answer.');
      },
    );
    console.log(answer);
  };

  const updateAnswer = (questionId: string, answer: string) => {
    QuizzDataHandler.updateAnswer(
      answer,
      (err) => console.log('Something happened when saving the answer.'),
      () => {
        console.log('Successfully saved an answer.');
      },
    );
    console.log(answer);
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
        return (
          <Fragment>
            <Button color="danger" onClick={() => leaveQuiz()} block>
              Leave Quiz
            </Button>
            <PrepareGame {...state.quiz} />
          </Fragment>
        );
      case GameState.prepareRound:
        return <PrepareRound />;
      case GameState.selectQuestion:
        return <PrepareQuestion />;
      case GameState.questionTime:
        return (
          <Question
            question={state.quiz.currentQuestion}
            sendAnswer={(questionId, answer) => sendAnswer(questionId, answer)}
            sendUpdate={(questionId, answer) =>
              updateAnswer(questionId, answer)
            }
          />
        );
      default:
        return <p>404 GameState not found. Please return to Room Selection.</p>;
    }
  }
};
