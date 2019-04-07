import React, { FunctionComponent, Fragment } from 'react';
import { AnswerModel } from './TeamGame';
import Button from 'reactstrap/lib/Button';

export const QuestionJudging: FunctionComponent<{
  question: {
    question: string;
    answer: string;
  };
  teamAnswer?: AnswerModel;
}> = (props) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  const notifyQuizMasterForNextQuestion = () => {
    console.log('Team is ready for next question!');
  };

  const renderAnswerGiven = (answer: AnswerModel) => {
    return (
      <Fragment>
        <p>{props.question.question}</p>
        <p>Your answer:</p>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center'}}>
          <p style={{ fontSize: '1.7em', fontWeight: 'bold' }}>{answer.answer}</p>
          {answer.judged ? 
            answer.correct ? <span>{'v'}</span> : <span>{'x'}</span>
            : null 
          }
        </div>
        {answer.judged && !answer.correct ? (
          <p style={{ fontStyle: 'italic' }}>Answer should've been: {props.question.answer}</p>
        ) : null}
        <Button
          color="primary"
          block
          onClick={() => notifyQuizMasterForNextQuestion()}
        >
          Next question
        </Button>
      </Fragment>
    );
  };

  const renderNoAnswerGiven = () => {
    return (
      <Fragment>
        <p>{props.question.question}</p>
        <p style={{ fontSize: '1.7em', fontWeight: 'bold' }}>It seems you didn't send an answer.</p>
        <p>Answer should've been: {props.question.answer}</p>
        <Button
          color="primary"
          block
          onClick={() => notifyQuizMasterForNextQuestion()}
        >
          Next question
        </Button>
      </Fragment>
    );
  };

  return props.teamAnswer
    ? renderAnswerGiven(props.teamAnswer)
    : renderNoAnswerGiven();
};
