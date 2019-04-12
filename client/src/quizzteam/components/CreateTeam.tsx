import React, { useState, useContext, useRef, Fragment } from 'react';
import { Team } from './Team';
import { Button } from 'reactstrap';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import InputGroup from 'reactstrap/lib/InputGroup';
import Input from 'reactstrap/lib/Input';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import { IoIosAdd, IoIosRemove } from 'react-icons/io';

interface CreateTeamProps {
  createTeam: CreateTeamFunc;
  team: Team;
}

interface CreateTeamFunc {
  (team: Team): void;
}

export const CreateTeam: React.FunctionComponent<CreateTeamProps> = (props) => {
  const [memberName, setMemberName] = useState<string>('');
  const [team, setTeam] = useState<Team>(props.team);
  const refContainer = useRef<any>(null);
  const [nameError, setNameError] = useState<string>('');

  return (
    <Fragment>
      <h1>Team Creation</h1>
      <div
        className="teamname-container"
        style={{ margin: '20px 0px', position: 'relative' }}
      >
        <Input
          placeholder="Team name"
          value={team.name}
          onChange={(event) => {
            if (event.target.value === '') {
              setNameError('Team name should not be empty.');
            } else if (nameError) {
              setNameError('');
            }
            setTeam({
              name: event.target.value,
              members: team.members,
            });
          }}
        />
        <p
          style={{
            color: 'red',
            fontSize: '.8em',
            textAlign: 'left',
            margin: '2px',
            padding: '0',
            position: 'absolute',
          }}
        >
          {nameError}
        </p>
      </div>
      <div
        className="add-member-container"
        style={{
          margin: '20px 0px',
          visibility: team.members.length >= 5 ? 'hidden' : 'visible',
        }}
      >
        <InputGroup>
          <Input
            placeholder="Member name"
            ref={refContainer}
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
          />
          <InputGroupAddon addonType="append">
            <Button
              disabled={memberName === ''}
              color="success"
              onClick={() => {
                setTeam({
                  name: team.name,
                  members: [...team.members, memberName],
                });
                setMemberName('');
                refContainer && refContainer.current
                  ? refContainer.current.focus()
                  : null;
              }}
            >
              <IoIosAdd style={{ color: 'white', fontSize: '1.3em' }} />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div
        className="member-container"
        style={{ flex: '1 auto', overflowY: 'auto' }}
      >
        <p>
          {team.members.length < 2
            ? `Atleast two members required`
            : `Members (${team.members.length}/5):`}
        </p>
        <ListGroup flush>
          {team.members.map((member, index) => (
            <ListGroupItem
              key={index}
              style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                justifyContent: 'center',
              }}
            >
              <p style={{ padding: '0', margin: 'auto' }}>{member}</p>
              <Button
                color="link"
                onClick={() =>
                  setTeam({
                    name: team.name,
                    members: team.members.filter(
                      (filterMem) => filterMem !== member,
                    ),
                  })
                }
              >
                <IoIosRemove style={{ color: 'red', fontSize: '1.3em' }} />
              </Button>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
      <Button
        disabled={team.members.length < 2 || team.name === ''}
        color="primary"
        block
        onClick={() => {
          if (team.name !== '') {
            props.createTeam(team);
          } else {
            setNameError('Team name should not be empty.');
          }
        }}
      >
        Create Team!
      </Button>
    </Fragment>
  );
};
