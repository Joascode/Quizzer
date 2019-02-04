import React, { useState, FunctionComponent, FormEvent } from 'react';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Button } from 'reactstrap';

interface CreateQuizState {
  name: string;
  password: string;
  addPassword: boolean;
  maxNQuestions: number;
}

interface CreateQuizProps {
  createQuiz: CreateQuizFunc;
}

interface CreateQuizFunc {
  (name: string, maxNQuestions: number, pass: string): void;
}

export const CreateQuiz: FunctionComponent<CreateQuizProps> = props => {
  const [quizInfo, setQuizInfo] = useState<CreateQuizState>({
    name: '',
    password: '',
    addPassword: false,
    maxNQuestions: 2,
  });

  const createTeam = async (event: FormEvent) => {
    event.preventDefault();
    props.createQuiz(quizInfo.name, quizInfo.maxNQuestions, quizInfo.password);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setQuizInfo({
      ...quizInfo,
      [name]: value,
    });
  };

  return (
    <Container>
      <Row>
        <Col>
      <h1>Let's create a Quiz!</h1>
      </Col>
      <Col>
      <form onSubmit={createTeam}>
        <Container>
          <Row>
            <Col>
        <label>
          Quiz name
          <input
            name="name"
            value={quizInfo.name}
            onChange={handleInputChange}
          />
        </label>
        </Col>
        <label>
          Number of Questions per round
          <input
            name="maxNQuestions"
            value={quizInfo.maxNQuestions}
            onChange={handleInputChange}
          />
        </label>
        <Col>
        <label>
          Password?
          <input
            name="addPassword"
            type="checkbox"
            checked={quizInfo.addPassword}
            onChange={handleInputChange}
          />
        </label>
        </Col>
        {quizInfo.addPassword ? (
          <div>
            <label>Enter password</label>
            <input
              name="password"
              type='password'
              value={quizInfo.password}
              onChange={handleInputChange}
            />
          </div>
        ) : null}
        <Button color='primary' block>Create</Button>
        </Row>
        </Container>
      </form>
      </Col>
      </Row>
    </Container>
  );
};
