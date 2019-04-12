import React, { FunctionComponent, Fragment, useState } from 'react';
import { TeamModel } from './HostGame';
import Button from 'reactstrap/lib/Button';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import { IoIosRemove } from 'react-icons/io';

interface PrepareQuizProps {
  teams: TeamModel[];
  addTeam: (team: any) => void;
  startQuiz: () => void;
  removeTeam: (team: any) => void;
}

export const PrepareQuiz: FunctionComponent<PrepareQuizProps> = (props) => {
  const [openTeams, setOpenTeams] = useState<string[]>([]);

  const openTeam = (teamId: string) => {
    const alreadyOpenTeam = openTeams.findIndex((team) => team === teamId);
    if (alreadyOpenTeam >= 0) {
      setOpenTeams(openTeams.filter((team) => team !== teamId));
    } else {
      setOpenTeams([...openTeams, teamId]);
    }
  };

  return (
    <Fragment>
      <h1>Waiting for Teams</h1>
      {props.teams.length <= 0 ? (
        <p style={{ flex: '1 auto' }}>No teams joined yet.</p>
      ) : (
        <ListGroup
          flush
          style={{ flex: '1 auto', overflowY: 'auto', textAlign: 'left' }}
        >
          {props.teams.map((team, index) => {
            return (
              <ListGroupItem key={index}>
                <div
                  style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                  }}
                >
                  <p
                    style={{ margin: '0', padding: '0', cursor: 'pointer' }}
                    onClick={() => openTeam(team._id)}
                  >
                    Team: <strong>{team.name}</strong>
                  </p>
                  <Button color="link" onClick={() => props.removeTeam(team)}>
                    <IoIosRemove style={{ color: 'red', fontSize: '1.3em' }} />
                  </Button>
                </div>
                {openTeams.findIndex((open) => open === team._id) >= 0 ? (
                  <div style={{ margin: '0px 0px 5px' }}>
                    <p style={{ fontSize: '.85em' }}>Team members</p>
                    <ListGroup flush={false} style={{ fontSize: '.85em' }}>
                      {team.members.map((member, index) => {
                        return (
                          <ListGroupItem key={index}>{member}</ListGroupItem>
                        );
                      })}
                    </ListGroup>
                  </div>
                ) : null}
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
      <Button
        color="success"
        disabled={props.teams.length <= 1}
        onClick={() => props.startQuiz()}
        block
      >
        Start!
      </Button>
    </Fragment>
  );
};
