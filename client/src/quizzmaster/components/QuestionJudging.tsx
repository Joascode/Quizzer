import React, { FunctionComponent, Fragment } from 'react';
import { TeamModel, QuestionModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';

interface QuestionAnsweringProps {
  teams: TeamModel[];
  question: QuestionModel | undefined;
  endOfRound: boolean;
  nextQuestion: () => void;
  endRound: () => void;
  setIncorrect: (teamId: string) => void;
  setCorrect: (teamId: string) => void;
}

export const QuestionJudging: FunctionComponent<
  QuestionAnsweringProps
> = props => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  return (
    <Fragment>
      <h1>Question Judging Time!</h1>
      <div>
        <h3>{props.question.question}</h3>
        <p>{props.question.answer}</p>
      </div>
      <ListGroup>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              {team.name} {team.answer.value}{' '}
              {team.answer.correct ? (
                <div>
                  <p>V</p>
                  <Button onClick={() => props.setIncorrect(team._id)}>
                    Incorrect
                  </Button>
                </div>
              ) : (
                <Button onClick={() => props.setCorrect(team._id)}>
                  Correct
                </Button>
              )}
            </ListGroupItem>
          );
        })}
      </ListGroup>
      {props.endOfRound ? (
        <Button onClick={() => props.endRound()}>End Round</Button>
      ) : (
        <Button onClick={() => props.nextQuestion()}>Next Question</Button>
      )}
    </Fragment>
  );
};
