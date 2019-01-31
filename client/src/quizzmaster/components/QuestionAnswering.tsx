import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { TeamModel, QuestionModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';

interface QuestionAnsweringProps {
  teams: TeamModel[];
  question: QuestionModel | undefined;
  // decideAnswer: (teamAnswer: TeamAnswerModel, correct: boolean) => void;
  closeQuestion: () => void;
  annoyTeam: (annoyance: any, teamId: string) => void;
}

export const QuestionAnswering: FunctionComponent<
  QuestionAnsweringProps
> = props => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  const [timeToClose, setTimeToClose] = useState(15);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setTimeToClose(timeToClose - 1);
    }, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  });

  const closeQuestion = () => {
    props.closeQuestion();
  };

  return (
    <Fragment>
      <h1>Question time!</h1>
      <div>
        <h3>{props.question.question}</h3>
        <p>{props.question.answer}</p>
      </div>
      <ListGroup>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              {team.name} {team.answer.value}{' '}
              <Button onClick={() => props.annoyTeam('Annoy', team._id)}>
                Annoy
              </Button>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <Button disabled={timeToClose > 0} onClick={() => closeQuestion()}>
        {' '}
        {/* TODO: Activate button when every team has answered or when timer has ended */}
        {timeToClose > 0 ? timeToClose : 'Close Question'}
      </Button>
    </Fragment>
  );
};
