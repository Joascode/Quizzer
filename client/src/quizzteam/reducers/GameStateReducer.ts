interface GameStateActions {
  type: GameStateActionTypes;
  payload: any;
}

enum GameStateActionTypes {
  newQuestion,
  newTeams,
  newQuizInfo,
}

export const gameStateReducer = (
  gameState: any,
  action: GameStateActions,
): any => {
  switch (action.type) {
    case GameStateActionTypes.newQuestion:
      // TODO: Change return value
      return { open: true, id: action.payload };
    case GameStateActionTypes.newTeams:
      return { open: false, id: action.payload };
    case GameStateActionTypes.newQuizInfo:
      return { open: false, id: action.payload };
    default:
      return gameState;
  }
};
