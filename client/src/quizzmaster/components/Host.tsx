import React, { FunctionComponent, useState } from 'react';
import { CreateQuiz } from './CreateQuiz';
import { HostGame } from './HostGame';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Redirect } from 'react-router';
import Button from 'reactstrap/lib/Button';
import { IoIosArrowDropleft } from 'react-icons/io';

enum QuizState {
  createQuiz,
  quizCreated,
  returnToHome,
}

interface HostProps {
  onError: (reason: string) => void;
}

export interface QuizModel {
  name: string;
  maxNQuestions: number;
  password: string;
}

export const Host: FunctionComponent<HostProps> = (props) => {
  const [quizInfo, setQuizInfo] = useState<QuizModel>({
    name: '',
    maxNQuestions: 2,
    password: '',
  });
  const [quizState, setQuizState] = useState(QuizState.createQuiz);
  const createQuiz = (name: string, maxNQuestions: number, pass: string) => {
    setQuizInfo({
      name: name,
      maxNQuestions: maxNQuestions,
      password: pass,
    });
    setQuizState(QuizState.quizCreated);
  };

  const returnToHome = () => {
    setQuizState(QuizState.returnToHome);
  };

  switch (quizState) {
    case QuizState.returnToHome: {
      return <Redirect to="/" />;
    }
    case QuizState.createQuiz:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 6, offset: 3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button color="link" onClick={returnToHome}>
                  {
                    <IoIosArrowDropleft
                      style={{ color: '#007bff', fontSize: '1.3em' }}
                    />
                  }{' '}
                  Return
                </Button>
              </div>
              <CreateQuiz
                createQuiz={(name, nrQuestions, pass) =>
                  createQuiz(name, nrQuestions, pass)
                }
              />
            </Col>
          </Row>
        </Container>
      );
    case QuizState.quizCreated:
      return <HostGame onDisconnect={props.onError} quiz={quizInfo} />;
    default:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 4, offset: 4 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button color="link" onClick={returnToHome}>
                  {
                    <IoIosArrowDropleft
                      style={{ color: '#007bff', fontSize: '1.3em' }}
                    />
                  }{' '}
                  Return
                </Button>
              </div>
              <CreateQuiz
                createQuiz={(name, nrQuestions, pass) =>
                  createQuiz(name, nrQuestions, pass)
                }
              />
            </Col>
          </Row>
        </Container>
      );
  }
};
