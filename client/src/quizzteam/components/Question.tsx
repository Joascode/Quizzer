import React, { Fragment, useState, useEffect } from 'react';
import Button from 'reactstrap/lib/Button';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';

interface QuestionProps {
  question?: {
    _id: string;
    question: string;
    category: string;
  };
  poke: string;
  questionReceived: (question: any) => void;
  sendAnswer: (questionId: string, answer: string) => void;
  sendUpdate: (questionId: string, answer: string) => void;
}

// TODO: Encapsulate component with HOC for question fetching.
export const Question: React.FunctionComponent<QuestionProps> = (props) => {
  if (!props.question) {
    return <div>No question available.</div>;
  }

  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState<{
    _id: string;
    question: string;
    category: string;
  }>(props.question);
  const [previousAnswers, addToPrreviousAnswers] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [lastGivenAnswer, setLastGivenAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (props.question) {
      console.log(props.question._id);
      QuizzDataHandler.fetchQuestion(
        props.question._id,
        (err) => console.log(err),
        (question) => {
          if (mounted) {
            props.questionReceived(question);
            setQuestion({
              _id: question._id,
              question: question.question,
              category: question.category.category,
            });
          }
        },
      );
    }
    return () => {
      mounted = false;
    };
  }, [props.question._id]);

  const sendAnswer = () => {
    if (answer !== '') {
      setAnswerError('');
      addToPrreviousAnswers([...previousAnswers, answer]);
      setLastGivenAnswer(answer);
      props.sendAnswer(question._id, answer);
      setAnswered(true);
    } else {
      setAnswerError('Answer should not be empty.');
    }
  };

  const sendUpdate = () => {
    if (answer !== '' && answer !== lastGivenAnswer) {
      setAnswerError('');
      addToPrreviousAnswers([...previousAnswers, answer]);
      setLastGivenAnswer(answer);
      props.sendUpdate(question._id, answer);
    } else if (answer === '') {
      setAnswerError('Answer should not be empty.');
    } else if (answer === lastGivenAnswer) {
      setAnswerError('New answer should not equal last answer');
    }
  };

  return (
    <Fragment>
      <h3>{question.question}</h3>
      <p>{question.category}</p>
      <input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />
      {answerError ? <p style={{ color: 'red' }}>{answerError}</p> : null}
      {props.poke ? <p>{props.poke}</p> : null}
      {answered ? (
        <Button onClick={() => sendUpdate()}>Update</Button>
      ) : (
        <Button onClick={() => sendAnswer()}>Send</Button>
      )}
      <Button onClick={() => setAnswer('')}>Clear</Button>
      <ListGroup>
        {previousAnswers.map((previousAnswer, index) => {
          return <ListGroupItem key={index}>{previousAnswer}</ListGroupItem>;
        })}
      </ListGroup>
    </Fragment>
  );
};
