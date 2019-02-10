export enum WSActions {
  getTeams = 'getTeams',
  questionSelected = 'questionSelected',
  getAnswer = 'getAnswer',
  newRound = 'newRound',
  closeRound = 'closeRound',
  closeQuestion = 'closeQuestion',
  teamRemoved = 'teamRemoved',
  quizClosed = 'quizClosed',
  quizStarted = 'quizStarted',
  getQuizInfo = 'getQuizInfo',
  createQuiz = 'createQuiz',
  joinQuiz = 'joinQuiz',
  leftQuiz = 'leftQuiz',
  onDrasticError = 'onDrasticError',
  gameStateChanged = 'gameStateChanged',
  questionAnswered = 'questionAnswered',
  answerJudged = 'answerJudged',
  poked = 'poked',
}

interface OnMessageFunc {
  (data: any): void;
}

export class QuizzWebsocketAPI {
  private static ws: WebSocket | null = null;

  public static hostQuiz(
    quizId: string,
    onsuccess: () => void = () => {},
    onerror: OnMessageFunc = () => {},
  ) {
    try {
      if (this.ws) {
        this.ws.send(
          this.createGeneralMessageStringified(WSActions.createQuiz, {
            quizId: quizId,
          }),
        );
        onsuccess();
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }

  public static connect(
    url: string,
    onConnectCb: OnMessageFunc,
    onCloseCb: OnMessageFunc,
  ) {
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = async (event) => {
        if (this.ws) {
          onConnectCb({
            type: 'connected',
            message: `Successfully connected to the server.`,
          });
        } else {
          onConnectCb({
            type: 'error',
            message: `Unable to connect to server.`,
          });
        }
      };
      this.ws.onclose = (event) => {
        onCloseCb(event);
      };
    } catch (error) {
      console.log(error.message);
      onConnectCb({
        type: 'error',
        message: `Unable to connect to server.`,
      });
    }
  }

  public static joinQuiz(
    quizId: string,
    teamId: string,
    onsuccess: () => void = () => {},
    onerror: OnMessageFunc = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createGeneralMessageStringified(WSActions.joinQuiz, {
            quizId: quizId,
            teamId: teamId,
          }),
        );
        onsuccess();
      } catch (err) {
        onerror(err);
      }
    } else {
      onerror(
        'No Websocket connection available. Please connect to the server first.',
      );
    }
  }

  public static leaveQuiz(
    quizId?: string,
    teamId?: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createGeneralMessageStringified(WSActions.leftQuiz, {
            quizId: quizId,
            id: teamId,
          }),
        );
        onsuccess();
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  public static removeTeam(
    quizId: string,
    teamId: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createGeneralMessageStringified(WSActions.teamRemoved, {
            quizId: quizId,
            id: teamId,
          }),
        );
        onsuccess();
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  public static changeGameState(
    quizId: string,
    state: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(
            WSActions.gameStateChanged,
            quizId,
            {
              state: state,
            },
          ),
        );
        onsuccess();
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static sendQuestion(
    quizId: string,
    id: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(
            WSActions.questionSelected,
            quizId,
            {
              questionId: id,
            },
          ),
        );
        onsuccess();
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static sendAnswer(
    quizId: string,
    answer: any,
    onsuccess: (answer: any) => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(
            WSActions.questionAnswered,
            quizId,
            {
              answerId: answer._id,
            },
          ),
        );
        onsuccess(answer);
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static notifyTeamAnswerCorrectness(
    quizId: string,
    data: { teamId: string; answer: {} },
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(
            WSActions.answerJudged,
            quizId,
            data,
          ),
        );
        onsuccess();
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static closeQuestion(
    quizId: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(WSActions.closeQuestion, quizId),
        );
        onsuccess();
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static startRound(
    quizId: string,
    roundNr: number,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(WSActions.newRound, quizId, {
            roundNr: roundNr,
          }),
        );
        onsuccess();
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static poke(
    quizId: string,
    teamId: string,
    poke: string,
    onsuccess: () => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(WSActions.poked, quizId, {
            teamId: teamId,
            poke: poke,
          }),
        );
        onsuccess();
      } catch (err) {
        console.log(err.message);
        throw err;
      }
    } else {
      throw new Error('No websocket connection available');
    }
  }

  public static onMessage(onmessageCb: OnMessageFunc) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('New message');
        console.log(data);
        onmessageCb(data);
      };
    } else {
      console.error(
        'No websocket connection available. Please call connect or host first.',
      );
    }
  }

  public static onDisconnect(cb: () => void) {
    if (this.ws) {
      this.ws.onclose = (event) => {
        console.log('Websocket disconnected');
        cb();
      };
    }
  }

  public static send(action: WSActions, data = {}) {
    if (this.ws) {
      this.ws.send(this.createGeneralMessageStringified(action, data));
    }
  }

  // public static sendAnswer(teamId: string, answer: string) {
  //   QuizzDataAPI.postAnswer(this.quizId, teamId, answer).then(() => {
  //     if (this.ws) {
  //       this.ws.send(this.createMessageStringified(WSActions.getAnswer));
  //     }
  //   });
  // }

  public static closeQuiz(
    quizId: string,
    onsuccess: () => void = () => {},
    onerror: (err: any) => void = () => {},
  ) {
    if (this.ws) {
      try {
        this.ws.send(
          this.createRoomMessageStringified(WSActions.quizClosed, quizId),
        );
        this.closeWS(quizId, quizId);
        onsuccess();
      } catch (err) {
        onerror(err.message);
      }
    } else {
      onerror('Unable to close connection.');
    }
  }

  public static closeWS(quizId?: string, id?: string) {
    if (this.ws) {
      this.ws.close(1000);
    }
  }

  private static createGeneralMessageStringified(action: WSActions, data = {}) {
    const msg = {
      type: 'message',
      action: action,
      data: data,
      date: Date.now(),
    };
    return JSON.stringify(msg);
  }

  private static createRoomMessageStringified(
    action: WSActions,
    quizId: string,
    data = {},
  ) {
    const msg = {
      type: 'message',
      action: action,
      quizId: quizId,
      data: data,
      date: Date.now(),
    };
    return JSON.stringify(msg);
  }

  private static createPrivateMessageStringified(
    action: WSActions,
    quizId: string,
    receiver: string = 'host',
    data = {},
  ) {
    const msg = {
      type: 'message',
      action: action,
      quizId: quizId,
      receiver: receiver,
      data: data,
      date: Date.now(),
    };
    return JSON.stringify(msg);
  }
}
