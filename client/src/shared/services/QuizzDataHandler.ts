import { QuizzWebsocketAPI, WSActions } from './QuizzWebsocketAPI';
import { QuizzDataAPI } from './QuizzDataAPI';
import { QuizModel } from '../../quizzmaster/components/Host';
import { Team } from '../../quizzteam/components/Team';
import { GameInfoModel, TeamWithId } from '../../quizzteam/components/TeamGame';
import {
  GameStates,
  CategoryModel,
} from '../../quizzmaster/components/HostGame';

export class QuizzDataHandler {
  private static teamJoinCb?: (data: any) => void;
  private static onDisconnectCb?: () => void;
  private static onTeamLeftCb?: (id: string) => void;
  private static onTeamKickCb?: (id: string) => void;
  private static onQuizCloseCb?: () => void;
  private static onGameStateChangeCb?: (gameState: GameStates) => void;
  private static onQuestionSelectedCb?: (questionId: string) => void;
  private static onAnswerCb?: (teamId: string) => void;
  private static onAnswerJudgedCb?: (answer: any) => void;
  private static onNewRoundCb?: (roundNr: number) => void;
  private static onPokeCb?: (poke: { teamId: string; poke: string }) => void;
  private static quizId?: string;
  private static teamId?: string;
  private static connected = false;
  private static host = false;

  public static connect() {
    QuizzWebsocketAPI.connect(
      'ws://localhost:8081/',
      () => {
        console.log('Connected');
        this.connected = true;
      }, 
      () => console.log('Closed'),
    );

    QuizzWebsocketAPI.onMessage((message) => {
      switch (message.action) {
        case WSActions.joinQuiz:
          this.getTeam(message.data.quizId, message.data.teamId);
          break;
        case WSActions.quizClosed:
          this.onDisconnectCb
            ? this.onDisconnectCb()
            : console.log('No callback set for closing of quiz.');
          break;
        case WSActions.leftQuiz:
          this.onTeamLeftCb
            ? this.onTeamLeftCb(message.data.id)
            : console.log('No callback set for leaving of team.');
          break;
        case WSActions.teamRemoved:
          this.onTeamKickCb
            ? this.onTeamKickCb(message.data.id)
            : console.log('No callback set for kicking of team.');
          break;
        case WSActions.gameStateChanged:
          this.onGameStateChangeCb
            ? this.onGameStateChangeCb(message.data.state)
            : console.log('No callback set for state change.');
          break;
        case WSActions.questionSelected:
          this.onQuestionSelectedCb
            ? this.onQuestionSelectedCb(message.data.questionId)
            : console.log('No callback set for question selected.');
          break;
        case WSActions.questionAnswered:
          this.onAnswerCb
            ? this.onAnswerCb(message.data.answerId)
            : console.log('No callback set for answer given.');
          break;
        case WSActions.poked:
          this.onPokeCb
            ? this.onPokeCb(message.data)
            : console.log('No callback set for poked');
          break;
        case WSActions.answerJudged:
          this.onAnswerJudgedCb
            ? this.onAnswerJudgedCb(message.data)
            : console.log('No callback set for answer judged.');
          break;
        case WSActions.newRound:
          this.onNewRoundCb
            ? this.onNewRoundCb(message.data.roundNr)
            : console.log('No callback set for new round.');
          break;
      }
    });

    QuizzWebsocketAPI.onDisconnect(() => {
      if (this.onDisconnectCb) this.onDisconnectCb();
    });
  }

  // TODO: Encapsulate the creation of a room with a db call so the room is first stored in the db.
  public static hostGame(
    quiz: QuizModel,
    onsuccess: (quiz: any) => void = (quiz: any) => {},
    onerror: (err: any) => void = () => {},
  ) {
    QuizzDataAPI.createQuiz(quiz)
      .then((newQuiz) => {
        QuizzWebsocketAPI.hostQuiz(newQuiz._id);
        this.quizId = newQuiz._id;
        this.host = true;
        onsuccess(newQuiz);
      })
      .catch((err) => onerror(err));
  }

  public static joinQuiz(
    quizId: string,
    password: string,
    team: Team,
    onsuccess: (data: GameInfoModel, joinedTeam: any) => void,
    onerror: (err: any) => void = () => {},
  ) {
    QuizzDataAPI.joinQuiz(quizId, password, team)
      .then((response) => {
        console.log('Response after joining quiz.');
        console.log(response);
        // TODO: Add checking if data exists.
        const joinedTeam = response.teams.find(
          (findTeam: any) => findTeam.name === team.name,
        );
        this.quizId = quizId;
        this.teamId = joinedTeam._id;
        QuizzWebsocketAPI.joinQuiz(quizId, joinedTeam._id, () => {
          onsuccess(response, joinedTeam);
        });
      })
      .catch((err) => {
        console.log('An error occured. ' + err.message);
        onerror(err);
      });
  }

  public static connectToQuiz(
    quizId: string,
    teamId: string,
    onsuccess: () => void,
    onerror: (err: any) => void = () => {},
  ) {
    QuizzWebsocketAPI.joinQuiz(quizId, teamId, () => {
      onsuccess();
    });
  }

  // TODO: Encapsulate with removing the team from db or set to left/removed in db.
  public static leaveQuiz(
    quizId?: string,
    teamId?: string,
    onerror: () => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (quizId && teamId) {
      QuizzDataAPI.removeTeam(quizId, teamId)
        .then(() => {
          try {
            QuizzWebsocketAPI.leaveQuiz(quizId, teamId, onsuccess);
          } catch (err) {
            throw new Error(err);
          }
        })
        .catch((err) => {
          console.log('Something bad happened when removing a team.');
          console.log(err.message);
          onerror();
        });
    } else {
      try {
        QuizzWebsocketAPI.leaveQuiz(quizId, teamId, onsuccess);
      } catch (err) {
        onerror();
      }
    }
  }

  public static removeTeam(
    quizId: string,
    teamId: string,
    onerror: () => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    QuizzDataAPI.removeTeam(quizId, teamId)
      .then(() => {
        try {
          QuizzWebsocketAPI.removeTeam(quizId, teamId, onsuccess);
        } catch (err) {
          throw new Error(err);
        }
      })
      .catch((err) => {
        console.log('Something bad happened when removing a team.');
        console.log(err.message);
        onerror();
      });
  }

  public static startQuiz(
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      const quizId = this.quizId;
      QuizzDataAPI.closeQuiz(quizId)
        .then(() => {
          QuizzWebsocketAPI.changeGameState(
            quizId,
            GameStates.prepareRound.toString(),
            onsuccess,
          );
        })
        .catch((err) => {
          console.log('Something bad happened when closing the quiz.');
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  // TODO: Encapsulate with saving of selected categories on specific round
  public static startRound(
    roundNr: number,
    categoryIds: string[],
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      const quizId = this.quizId;
      QuizzDataAPI.startRound(quizId, roundNr, categoryIds)
        .then((round) => {
          QuizzWebsocketAPI.startRound(quizId, roundNr, onsuccess);
        })
        .catch((err) => {
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static calculateTeamScores(
    roundNr: number,
    onerror: (msg: string) => void = () => {},
    onsuccess: (
      scores: [{ teamId: string; totalCorrectAnswers: number; score: number }],
    ) => void = () => {},
  ) {
    if (this.quizId) {
      QuizzDataAPI.saveTeamsRoundScores(this.quizId, roundNr)
        .then(
          (
            scores: [
              { teamId: string; totalCorrectAnswers: number; score: number }
            ],
          ) => {
            onsuccess(scores);
          },
        )
        .catch((err: Error) => onerror(err.message));
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static getTeamsRoundScores(
    roundNr: number,
    onerror: (msg: string) => void = () => {},
    onsuccess: (scores: {
      teams: TeamWithId[];
      teamScores: [
        { teamId: string; totalCorrectAnswers: number; score: number }
      ];
    }) => void = () => {},
  ) {
    if (this.quizId) {
      QuizzDataAPI.fetchTeamsRoundScores(this.quizId, roundNr)
        .then(
          (scores: {
            teams: TeamWithId[];
            teamScores: [
              { teamId: string; totalCorrectAnswers: number; score: number }
            ];
          }) => {
            onsuccess(scores);
          },
        )
        .catch((err: Error) => onerror(err.message));
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static endRound(
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      QuizzWebsocketAPI.changeGameState(
        this.quizId,
        GameStates.closeRound,
        onsuccess,
      );

      // QuizzWebsocketAPI.closeQuestion(this.quizId, onsuccess);
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  // TODO: Encapsulate with saving of selected question on specific round
  // TODO: Does not yet send the questionId to the team
  public static startQuestion(
    questionId: string,
    roundNr: number,
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      const quizId = this.quizId;
      QuizzDataAPI.saveSelectedQuestion(quizId, roundNr, questionId)
        .then((round) => {
          QuizzWebsocketAPI.sendQuestion(quizId, questionId, onsuccess);
        })
        .catch((err) => {
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static selectingNewQuestion(
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      QuizzWebsocketAPI.changeGameState(
        this.quizId,
        GameStates.selectQuestion,
        onsuccess,
      );

      // QuizzWebsocketAPI.closeQuestion(this.quizId, onsuccess);
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static closeQuestion(
    onerror: (msg: string) => void = () => {},
    onsuccess: () => void = () => {},
  ) {
    if (this.quizId) {
      QuizzWebsocketAPI.changeGameState(
        this.quizId,
        GameStates.questionJudging,
        onsuccess,
      );

      // QuizzWebsocketAPI.closeQuestion(this.quizId, onsuccess);
    } else {
      onerror(`Couldn't close quiz, missing quiz id.`);
    }
  }

  public static fetchCategories(
    onerror: (error: string) => void,
    onsuccess: (categories: any) => void,
  ) {
    QuizzDataAPI.getCategories()
      .then((categories: any) => {
        onsuccess(categories);
      })
      .catch((err: Error) => {
        console.log('Getting categories failed.');
        onerror(err.message);
      });
  }

  public static fetchRandomQuestions(
    availableCategories: CategoryModel[],
    onerror: (error: string) => void,
    onsuccess: (questions: any) => void,
  ) {
    QuizzDataAPI.getRandomQuestions(availableCategories)
      .then((questions: any) => {
        onsuccess(questions);
      })
      .catch((err: Error) => {
        console.log('Getting categories failed.');
        onerror(err.message);
      });
  }

  public static fetchQuestion(
    questionId: string,
    onerror: (error: string) => void,
    onsuccess: (questions: any) => void,
  ) {
    QuizzDataAPI.getQuestion(questionId)
      .then((question: any) => {
        onsuccess(question);
      })
      .catch((err: Error) => {
        console.log('Getting categories failed.');
        onerror(err.message);
      });
  }

  public static saveAnswer(
    roundNr: number,
    questionId: string,
    answer: string,
    onerror: (error: string) => void,
    onsuccess: (answer: any) => void,
  ) {
    if (this.quizId && this.teamId) {
      const quizId = this.quizId,
        teamId = this.teamId;
      QuizzDataAPI.saveAnswer(quizId, teamId, roundNr, questionId, answer)
        .then((answer) => {
          QuizzWebsocketAPI.sendAnswer(quizId, answer, onsuccess);
        })
        .catch((err: Error) => {
          console.log('Saving answer failed.');
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror('No quizId or teamId set.');
    }
  }

  public static updateAnswer(
    answerId: string,
    answer: string,
    onerror: (error: string) => void,
    onsuccess: (answer: any) => void,
  ) {
    if (this.quizId && this.teamId) {
      const quizId = this.quizId,
        teamId = this.teamId;
      QuizzDataAPI.updateAnswer(answerId, answer)
        .then((answer) => {
          QuizzWebsocketAPI.sendAnswer(quizId, answer, onsuccess);
        })
        .catch((err: Error) => {
          console.log('Updating answer failed.');
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror('No quizId or teamId set.');
    }
  }

  public static getAnswer(
    answerId: string,
    onerror: (error: string) => void,
    onsuccess: (answer: string) => void,
  ) {
    if (this.quizId) {
      const quizId = this.quizId;
      QuizzDataAPI.getAnswer(answerId)
        .then((answer: any) => {
          onsuccess(answer);
        })
        .catch((err: Error) => {
          console.log('Getting answer failed.');
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror('No quizId or teamId set.');
    }
  }

  public static pokeTeam(
    teamId: string,
    poke: string,
    onerror: (error: string) => void,
    onsuccess: () => void,
  ) {
    if (this.quizId) {
      QuizzWebsocketAPI.poke(this.quizId, teamId, poke, onsuccess);
    } else {
      onerror('No quizId or teamId set.');
    }
  }

  public static setAnswerCorrectness(
    teamId: string,
    answerId: string,
    correct: boolean,
    onerror: (error: string) => void,
    onsuccess: () => void,
  ) {
    if (this.quizId) {
      const quizId = this.quizId;
      QuizzDataAPI.setAnswerCorrectness(answerId, correct)
        .then((answer) => {
          QuizzWebsocketAPI.notifyTeamAnswerCorrectness(
            quizId,
            {
              teamId: teamId,
              answer: answer,
            },
            onsuccess,
          );
        })
        .catch((err: Error) => {
          console.log('Setting answer correctness failed.');
          console.log(err.message);
          onerror(err.message);
        });
    } else {
      onerror('No quizId or teamId set.');
    }
  }

  public static stopQuiz(
    onerror: (error: string) => void,
    onsuccess: () => void,
  ) {
    if (this.quizId) {
      QuizzWebsocketAPI.changeGameState(
        this.quizId,
        GameStates.stopQuiz,
        onsuccess,
      );
    }
  }

  public static onQuizClose(cb: () => void) {
    this.onQuizCloseCb = cb;
  }

  public static onTeamLeft(cb: (id: string) => void) {
    this.onTeamLeftCb = cb;
  }

  public static onTeamKick(cb: (id: string) => void) {
    this.onTeamKickCb = cb;
  }

  public static onGameStateChange(cb: (state: GameStates) => void) {
    this.onGameStateChangeCb = cb;
  }

  public static onQuestionSelected(cb: (id: string) => void) {
    this.onQuestionSelectedCb = cb;
  }

  public static onAnswer(cb: (teamId: string) => void) {
    this.onAnswerCb = cb;
  }

  public static onAnswerJudged(cb: (answer: any) => void) {
    this.onAnswerJudgedCb = cb;
  }

  public static onNewRound(cb: (roundNr: number) => void) {
    this.onNewRoundCb = cb;
  }

  public static onPoke(cb: (poke: { teamId: string; poke: string }) => void) {
    this.onPokeCb = cb;
  }

  // TODO: Catch errors that may arise.

  public static closeConnection() {
    if(this.connected) {
      if (this.quizId && this.host) QuizzDataAPI.closeQuiz(this.quizId); // TODO: Only call close quiz if it's the host.
      QuizzWebsocketAPI.closeWS();
      this.connected = false;
    }
  }

  // TODO: Catch errors that may arise.
  public static disconnectGame() {
    if(this.connected) {
      if (this.quizId && this.host) {
        QuizzDataAPI.closeQuiz(this.quizId); // TODO: Only call close quiz if it's the host.
        QuizzWebsocketAPI.closeQuiz(this.quizId);
      } else {
        QuizzWebsocketAPI.closeWS();
      }
      this.connected = false;
    }
  }

  public static onTeamJoin(cb: (data: any) => void) {
    this.teamJoinCb = cb;
  }

  public static onDisconnect(cb: () => void) {
    this.onDisconnectCb = cb;
  }

  private static getTeam(quizId: string, teamId: string) {
    QuizzDataAPI.getTeam(quizId, teamId)
      .then((response) => {
        if (this.teamJoinCb) {
          this.teamJoinCb(response);
        } else {
          console.log('No callback set for fetching teams.');
        }
      })
      .catch((err) =>
        console.log(
          'Encountered error when connecting to backend. ' + err.message,
        ),
      );
  }
}

// export const QuizzDataHandler = () => {
//   const ws = QuizzWebsocketAPI;
//   const api = QuizzDataAPI;
//   let joinQuizCb: (data: any) => void;

//   return {
//     joinQuiz: (cb: (data: any) => void) => {
//       joinQuizCb = cb;
//     },
//   };
// };
