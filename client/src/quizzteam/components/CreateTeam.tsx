import React, { useState, useContext, useRef } from 'react';
import { Team } from './Team';
import { Button } from 'reactstrap';

interface CreateTeamProps {
  createTeam: CreateTeamFunc;
  team: Team;
}

interface CreateTeamFunc {
  (team: Team): void;
}

export const CreateTeam: React.FunctionComponent<CreateTeamProps> = props => {
  const [memberName, setMemberName] = useState<string>('');
  const [team, setTeam] = useState<Team>(props.team);
  const refContainer = useRef<any>(null);

  return (
    <div>
      <h1>Please enter your team</h1>
      <p>Member count: {team.members.length}/5</p>
      <p>
        Team name: <strong>{team.name}</strong>
      </p>
      <p>Members:</p>
      <ul>
        {team.members.map((member, index) => (
          <li key={index}>
            <p>{member}</p>
            <Button
              onClick={() =>
                setTeam({
                  name: team.name,
                  members: team.members.filter(
                    filterMem => filterMem !== member,
                  ),
                })
              }
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <input
        placeholder="Team name"
        value={team.name}
        onChange={event =>
          setTeam({
            name: event.target.value,
            members: team.members,
          })
        }
      />
      <input
        placeholder="Member name"
        ref={refContainer}
        value={memberName}
        onChange={event => setMemberName(event.target.value)}
      />
      <Button
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
        Add
      </Button>
      <Button
        onClick={() => {
          props.createTeam(team);
        }}
      >
        Create Team!
      </Button>
    </div>
  );
};
