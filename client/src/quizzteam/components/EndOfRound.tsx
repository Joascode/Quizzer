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
  addRoundScoreToScore: (
    scores: [{ teamId: string; totalCorrectAnswers: number; score: number }],
  ) => void;
}

export const EndOfRound: FunctionComponent<EndOfRoundProps> = (props) => {
  const [teamsRoundScore, setTeamsRoundScore] = useState<
    [{ teamId: string; totalCorrectAnswers: number; score: number }] | undefined
  >(undefined);
  const [scoreAdded, isScoreAdded] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    QuizzDataHandler.getTeamsRoundScores(
      props.roundNr,
      (err: string) => console.log(err),
      (
        scores: [
          { teamId: string; totalCorrectAnswers: number; score: number }
        ],
      ) => {
        if (mounted) {
          setTeamsRoundScore(scores);
          setTimer(
            setTimeout(() => {
              props.addRoundScoreToScore(scores);
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

  return (
    <Fragment>
      <p>End of Round {props.roundNr}</p>
      <ListGroup>
        {props.teams.map((team) => {
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
