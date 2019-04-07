import React, { FunctionComponent, useEffect, useState, Fragment } from 'react';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { TeamWithId } from './TeamGame';
import Button from 'reactstrap/lib/Button';

interface EndOfRoundProps {
  teams: TeamWithId[];
  ownTeam: TeamWithId;
  roundNr: number;
  addRoundScoreToScore: (scores: TeamWithId[]) => void;
}

export const EndOfRound: FunctionComponent<EndOfRoundProps> = (props) => {
  const [teamsRoundScore, setTeamsRoundScore] = useState<
    [{ teamId: string; totalCorrectAnswers: number; score: number }] | undefined
  >(undefined);
  const [scoreAdded, isScoreAdded] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [teams, setTeams] = useState(props.teams.sort((teamA, teamB) => teamA.score - teamB.score));

  useEffect(() => {
    let mounted = true;
    QuizzDataHandler.getTeamsRoundScores(
      props.roundNr,
      (err: string) => console.log(err),
      (scores: {
        teams: TeamWithId[];
        teamScores: [
          { teamId: string; totalCorrectAnswers: number; score: number }
        ];
      }) => {
        if (mounted) {
          setTeamsRoundScore(scores.teamScores);
          setTimer(
            setTimeout(() => {
              props.addRoundScoreToScore(scores.teams);
              setTeams(teams.sort((teamA, teamB) => teamA.score - teamB.score))
              isScoreAdded(true);
            }, 2000),
          );
        }
      },
    );
    return () => {
      if (timer) clearTimeout(timer);
      mounted = false;
    };
  }, [props.roundNr]);

  // TODO: Wtf gebeurt hier? Waar is die check voor nodig?
  const renderTeamRoundScore = (team: TeamWithId) => {
    if (teamsRoundScore) {
      const teamRoundScore = teamsRoundScore.find(
        (score) => score.teamId === team._id,
      );
      if (teamRoundScore) {
        return <p>+ {teamRoundScore.score}</p>;
      }
    }
    return null;
  };

  const notifyQuizMasterForNextRound = () => {
    console.log('Team ready for next round!');
  };
  /* Sorteer op score voordat het wordt getoond */
  return (
    <Fragment>
      <p>End of Round: {props.roundNr}</p>
      <ListGroup> 
        {teams.map((team) => {
          return (
            <ListGroupItem>
              {team._id === props.ownTeam._id ? (
                <p style={{ fontWeight: 'bold' }}>{team.name}</p>
              ) : (
                <p>{team.name}</p>
              )}
              <p>{team.score}</p>
              {!scoreAdded ? renderTeamRoundScore(team) : null}
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <Button
        color="primary"
        block
        onClick={() => notifyQuizMasterForNextRound()}
      >
        Next round
      </Button>
    </Fragment>
  );
};
