import React, { FunctionComponent, useState } from 'react';
import { CreateQuiz } from './CreateQuiz';
import { HostGame } from './HostGame';

enum QuizState {
  createQuiz,
  quizCreated,
}

interface HostProps {
  onError: (reason: string) => void;
}

export interface QuizModel {
  name: string;
  maxNQuestions: number;
  password: string;
}

export const Host: FunctionComponent<HostProps> = props => {
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
  switch (quizState) {
    case QuizState.createQuiz:
      return (
        <CreateQuiz
          createQuiz={(name, nrQuestions, pass) =>
            createQuiz(name, nrQuestions, pass)
          }
        />
      );
    case QuizState.quizCreated:
      return <HostGame onDisconnect={props.onError} quiz={quizInfo} />;
    default:
      return (
        <CreateQuiz
          createQuiz={(name, nrQuestions, pass) =>
            createQuiz(name, nrQuestions, pass)
          }
        />
      );
  }
};
