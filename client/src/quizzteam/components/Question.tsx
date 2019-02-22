import React, { Fragment, useState, useEffect } from 'react';
import Button from 'reactstrap/lib/Button';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import { NimbleEmoji } from 'emoji-mart';
import data from 'emoji-mart/data/emojione.json';
import InputGroup from 'reactstrap/lib/InputGroup';
import Input from 'reactstrap/lib/Input';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import FormGroup from 'reactstrap/lib/FormGroup';
import FormFeedback from 'reactstrap/lib/FormFeedback';

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
    console.log('New poke arrived');
    console.log(props.poke);
    // https://github.com/missive/emoji-mart
  }, [props.poke]);

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
      addToPrreviousAnswers([answer, ...previousAnswers]);
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
      addToPrreviousAnswers([answer, ...previousAnswers]);
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
      <FormGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <Button color="link" onClick={() => setAnswer('')}>
              x
            </Button>
          </InputGroupAddon>
          <Input
            invalid={answerError !== ''}
            placeholder="Answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <InputGroupAddon addonType="append">
            {answered ? (
              <Button color="primary" onClick={() => sendUpdate()}>
                Update
              </Button>
            ) : (
              <Button color="primary" onClick={() => sendAnswer()}>
                Send
              </Button>
            )}
          </InputGroupAddon>
          <FormFeedback>{answerError}</FormFeedback>
        </InputGroup>
      </FormGroup>
      {/* 
      {answerError ? <p style={{ color: 'red' }}>{answerError}</p> : null} */}
      {props.poke ? (
        <p>
          Quiz Master pokes:{' '}
          <NimbleEmoji
            set="emojione"
            data={data}
            emoji={props.poke}
            size={20}
          />
        </p>
      ) : null}
      <p>Previous Answers</p>
      <ListGroup>
        {previousAnswers.map((previousAnswer, index) => {
          return <ListGroupItem key={index}>{previousAnswer}</ListGroupItem>;
        })}
      </ListGroup>
    </Fragment>
  );
};
