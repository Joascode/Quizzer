import { Team } from '../../quizzteam/components/Team';
import { MockData } from './MockData';
import { QuizModel } from '../../quizzmaster/components/Host';
import {
  TeamModel,
  CategoryModel,
} from '../../quizzmaster/components/HostGame';

export class QuizzDataAPI {
  private static serverUrl = 'http://localhost:8080';

  static async getQuizs(): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/open`).then((data) => {
      return data.json();
    });
  }

  static async createQuiz(quiz: QuizModel): Promise<any> {
    try {
      const newQuiz = await fetch(`${this.serverUrl}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ name: quiz.name, password: quiz.password }),
        headers: { 'Content-Type': 'application/json' },
      });
      return await newQuiz.json();
    } catch (err) {
      console.log(err);
    }
  }

  static async closeQuizForJoining(quizId: string | number): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/${quizId}`, {
      method: 'POST',
      body: JSON.stringify({ closeQuiz: true }),
      headers: { 'Content-Type': 'application/json' },
    }).then((data) => {
      return data.json();
    });
  }

  static async getTeams(quizId: number | string): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/${quizId}/teams`).then((data) =>
      data.json(),
    );
  }

  static async getTeam(quizId: string, teamId: string): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/${quizId}/team/${teamId}`).then(
      (data) => {
        console.log('GetTeam data');
        console.log(data);
        return data.json();
      },
    );
  }

  static async removeTeam(quizId: string, teamId: string): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/${quizId}/team/${teamId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {})
      .catch((err) => {
        throw new Error(err);
      });
  }

  static async closeQuiz(quizId: string): Promise<any> {
    return fetch(`${this.serverUrl}/quiz/${quizId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        console.log('Succesfully closed the quiz for others to join.');
      })
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });
  }

  static async getQuizInfo(quizId: number | string) {
    return fetch(`${this.serverUrl}/quiz/${quizId}`).then((data) =>
      data.json(),
    );
  }

  // static async getQuestion(questionId: number | string) {
  //   return this.fetchData('').then(data => data.currentRound);
  // }

  // static async postAnswer(
  //   quizId: number | string,
  //   teamId: number | string,
  //   answer: string,
  // ) {
  //   return this.fetchData('');
  // }

  // static async getAnswer(quizId: number | string, teamId: number | string) {
  //   return this.fetch('').then(data => data.currentRound);
  // }

  static async joinQuiz(quizId: number | string, password: string, team: Team) {
    console.log('Join quiz team:');
    console.log(team);
    const response = await fetch(`${this.serverUrl}/quiz/${quizId}/team`, {
      method: 'POST',
      body: JSON.stringify({ password: password, team: team }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      return await response.json();
    }
    console.log(await response.json());
    throw new Error('Unable to join quiz.');
  }

  static async checkPass(quizId: number | string, pass: string) {
    return fetch(`${this.serverUrl}/quiz/${quizId}/pass`, {
      method: 'POST',
      body: JSON.stringify({ pass: pass }),
      headers: { 'Content-Type': 'application/json' },
    }).then((data) => {
      if (data.status === 200) {
        return true;
      }
      return false;
    });
  }

  static async getCategories(): Promise<any> {
    return fetch(`${this.serverUrl}/categories`, {
      method: 'GET',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to fetch categories: ${data.status}`);
    });
  }

  static async startRound(
    quizId: string,
    roundNr: number,
    categoriesIds: string[],
  ): Promise<any> {
    return fetch(
      `${this.serverUrl}/quiz/${quizId}/round/${roundNr}/categories`,
      {
        method: 'POST',
        body: JSON.stringify({ ids: categoriesIds }),
        headers: { 'Content-Type': 'application/json' },
      },
    ).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save categories: ${data.status}`);
    });
  }

  static async getRandomQuestions(
    availableCategories: CategoryModel[],
  ): Promise<any> {
    const categoryIds = availableCategories.map((category) => category._id);
    let idUrlString = '';
    categoryIds.forEach((id) => {
      idUrlString += `/${id}`;
    });
    return fetch(`${this.serverUrl}/questions/random${idUrlString}`, {
      method: 'GET',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to fetch random questions: ${data.status}`);
    });
  }

  static async getQuestion(questionId: string): Promise<any> {
    return fetch(`${this.serverUrl}/question/${questionId}`, {
      method: 'GET',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to fetch question: ${data.status}`);
    });
  }

  static async saveSelectedQuestion(
    quizId: string,
    roundNr: number,
    questionId: string,
  ): Promise<any> {
    return fetch(
      `${
        this.serverUrl
      }/quiz/${quizId}/round/${roundNr}/question/${questionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    ).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save question: ${data.status}`);
    });
  }

  static async saveAnswer(
    quizId: string,
    teamId: string,
    roundNr: number,
    questionId: string,
    answer: string,
  ): Promise<any> {
    return fetch(
      `${
        this.serverUrl
      }/quiz/${quizId}/round/${roundNr}/question/${questionId}/team/${teamId}/answer`,
      {
        method: 'POST',
        body: JSON.stringify({
          answer: answer,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    ).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save answer: ${data.status}`);
    });
  }

  static async updateAnswer(answerId: string, answer: string): Promise<any> {
    return fetch(`${this.serverUrl}/answer/${answerId}`, {
      method: 'POST',
      body: JSON.stringify({
        answer: answer,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save answer: ${data.status}`);
    });
  }

  static async getAnswer(answerId: string): Promise<any> {
    return fetch(`${this.serverUrl}/answer/${answerId}`, {
      method: 'GET',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save answer: ${data.status}`);
    });
  }

  static async setAnswerCorrectness(
    answerId: string,
    correct: boolean,
  ): Promise<any> {
    return fetch(`${this.serverUrl}/answer/${answerId}/correct/${correct}`, {
      method: 'POST',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save answer: ${data.status}`);
    });
  }

  static async saveTeamsRoundScores(quizId: string, roundNr: number) {
    return fetch(`${this.serverUrl}/quiz/${quizId}/round/${roundNr}/scores`, {
      method: 'POST',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(
        `Unable to save answer: ${data.json().then((error) => error.errorMsg)}`,
      );
    });
  }

  static async fetchTeamsRoundScores(quizId: string, roundNr: number) {
    return fetch(`${this.serverUrl}/quiz/${quizId}/round/${roundNr}/scores`, {
      method: 'GET',
    }).then((data) => {
      console.log(data);
      if (data.status === 200) {
        return data.json();
      }
      throw new Error(`Unable to save answer: ${data.status}`);
    });
  }

  // private static async fetchData(
  //   input: RequestInfo,
  //   options?: RequestInit | undefined,
  // ): Promise<any> {
  //   return fetch(input, options)
  //     .then(async res => {
  //       const body = await res.json();
  //       console.log(body);
  //       return res.json();
  //     })
  //     .catch(err => console.log(err));
  // }
}
