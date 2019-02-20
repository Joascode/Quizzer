import React, { Fragment } from 'react';
import { GameInfoModel } from './TeamGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';

export const PrepareGame: React.FunctionComponent<GameInfoModel> = (props) => {
  return (
    <Fragment>
      <h1>Waiting for teams</h1>
      <div>
        <p>Teams</p>
        <ListGroup flush>
          {props.teams.map((team, index) => (
            <ListGroupItem key={index}>{team.name}</ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </Fragment>
  );
};
