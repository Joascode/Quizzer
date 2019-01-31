import React from 'react';
import { GameInfoModel } from './TeamGame';

export const PrepareGame: React.FunctionComponent<GameInfoModel> = props => {
  return (
    <div>
      <h1>Host is preparing the game</h1>
      <p>loading...</p>
      <div>
        <p>Teams:</p>
        <ul>
          {props.teams.map((team, index) => (
            <li key={index}>{team.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
