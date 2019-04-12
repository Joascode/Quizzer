import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { TeamModel, QuestionModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import { IoIosClose, IoIosCheckmark } from 'react-icons/io';

interface QuestionAnsweringProps {
  teams: TeamModel[];
  question: QuestionModel | undefined;
  endOfRound: boolean;
  nextQuestion: () => void;
  endRound: () => void;
  setIncorrect: (teamId: string, answerId: string) => void;
  setCorrect: (teamId: string, answerId: string) => void;
}

export const QuestionJudging: FunctionComponent<QuestionAnsweringProps> = (
  props,
) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  const [timeToClose, setTimeToClose] = useState(0);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted && timeToClose > 0) setTimeToClose(timeToClose - 1);
    }, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  });

  const renderButtonsBeforeJudgement = (team: any) => {
    return (
      <ButtonGroup>
        <Button
          color="link"
          onClick={() => props.setCorrect(team._id, team.answer._id)}
        >
          <IoIosCheckmark style={{ color: 'green', fontSize: '1.3em' }} />
        </Button>
        <Button
          color="link"
          onClick={() => props.setIncorrect(team._id, team.answer._id)}
        >
          <IoIosClose style={{ color: 'red', fontSize: '1.3em' }} />
        </Button>
      </ButtonGroup>
    );
  };

  const renderButtonsAfterJudgement = (team: any) => {
    return (
      <ButtonGroup>
        <Button
          color={team.answer.correct ? 'success' : 'link'}
          onClick={() => props.setCorrect(team._id, team.answer._id)}
        >
          <IoIosCheckmark
            style={{
              color: team.answer.correct ? 'white' : 'green',
              fontSize: '1.3em',
            }}
          />
        </Button>
        <Button
          color={!team.answer.correct ? 'danger' : 'link'}
          onClick={() => props.setIncorrect(team._id, team.answer._id)}
        >
          <IoIosClose
            style={{
              color: !team.answer.correct ? 'white' : 'red',
              fontSize: '1.3em',
            }}
          />
        </Button>
      </ButtonGroup>
    );
  };

  return (
    <Fragment>
      <h1>Question Judging Time!</h1>
      <div>
        <p>{props.question.question}</p>
        <p>{props.question.answer}</p>
      </div>
      <ListGroup style={{ margin: '0 0 10px' }}>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              <p style={{ textAlign: 'left' }}>Team: {team.name}</p>
              <div style={{ display: 'flex', flexFlow: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ textAlign: 'left', overflow: 'hidden' }}>
                    {team.answer.value !== ''
                      ? `Answer: ${team.answer.value}`
                      : 'No answer sent.'}{' '}
                  </p>
                  {team.answer.value !== ''
                    ? team.answer.judged
                      ? renderButtonsAfterJudgement(team)
                      : renderButtonsBeforeJudgement(team)
                    : null}
                </div>
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      {props.endOfRound ? (
        <Button
          disabled={timeToClose > 0}
          color="primary"
          onClick={() => props.endRound()}
        >
          {timeToClose > 0 ? timeToClose : 'End Round'}
        </Button>
      ) : (
        <Button
          disabled={timeToClose > 0}
          color="primary"
          onClick={() => props.nextQuestion()}
        >
          {timeToClose > 0 ? timeToClose : 'Next Question'}
        </Button>
      )}
    </Fragment>
  );
};
