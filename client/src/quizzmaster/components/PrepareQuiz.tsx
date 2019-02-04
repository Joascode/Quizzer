import React, { FunctionComponent, Fragment, useState } from 'react';
import { TeamModel } from './HostGame';
import Button from 'reactstrap/lib/Button';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';

interface PrepareQuizProps {
  teams: TeamModel[];
  addTeam: (team: any) => void;
  startQuiz: () => void;
  removeTeam: (team: any) => void;
}

export const PrepareQuiz: FunctionComponent<PrepareQuizProps> = props => {
  const [openTeams, setOpenTeams] = useState<string[]>([]);
  
  const openTeam = (teamId: string) => {
    const alreadyOpenTeam = openTeams.findIndex(team => team === teamId);
    if(alreadyOpenTeam >= 0) {
      setOpenTeams(openTeams.filter(team => team !== teamId));
    } else {
      setOpenTeams([...openTeams, teamId]);
    }
  }

  return (
    <Fragment>
      <div>PrepareQuiz!</div>
      <ListGroup>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              <p onClick={() => openTeam(team._id)} >{team.name}{' '}</p>
              {(openTeams.findIndex(open => open === team._id) >= 0) ? (<ListGroup>
                {team.members.map((member, index) => {
                  return (
                    <ListGroupItem key={index}>{member}</ListGroupItem>
                  )
                })}
              </ListGroup>) : null }
              <Button color='danger' onClick={() => props.removeTeam(team)}>X</Button>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      {props.teams.length > 1 ? (
        <Button onClick={() => props.startQuiz()}>Start!</Button>
      ) : null}
    </Fragment>
  );
};
