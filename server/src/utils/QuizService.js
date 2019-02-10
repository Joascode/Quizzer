const decideScoreOnPosition = (scoreTeam, position) => {
  const newScoreTeam = scoreTeam;
  switch (position) {
    case 0:
      newScoreTeam.score = 4;
      break;
    case 1:
      newScoreTeam.score = 2;
      break;
    case 2:
      newScoreTeam.score = 1;
      break;
    default:
      newScoreTeam.score = 0.1;
      break;
  }
  return newScoreTeam;
};

const calculateScoresOnSorted = sortedAnswerCount => {
  const scores = [];
  let previousCount = -1;
  let position = 0;

  sortedAnswerCount.forEach(teamCount => {
    const scoreTeam = { ...teamCount, score: 0 };
    if (teamCount.totalCorrectAnswers === 0) {
      scores.push(decideScoreOnPosition(scoreTeam, 4));
    } else if (teamCount.totalCorrectAnswers === previousCount) {
      position -= 1;
      scores.push(decideScoreOnPosition(scoreTeam, position));
    } else {
      scores.push(decideScoreOnPosition(scoreTeam, position));
    }
    position += 1;
    previousCount = teamCount.totalCorrectAnswers;
  });

  return scores;
};

export default {
  calculateScores: roundAnswers => {
    if (!roundAnswers) throw new Error('No answers to use to calculate the scores.');
    const teams = new Set();
    roundAnswers.forEach(answer => {
      teams.add(answer.teamId.toString());
    });

    const teamsCorrectAnswers = [];
    teams.forEach(team => {
      let correctAnswerCount = 0;
      roundAnswers.forEach(answer => {
        if (answer.teamId.toString() === team) {
          if (answer.correct) correctAnswerCount += 1;
        }
      });
      teamsCorrectAnswers.push({
        teamId: team,
        totalCorrectAnswers: correctAnswerCount
      });
    });

    const sorted = teamsCorrectAnswers.sort(
      (a, b) => b.totalCorrectAnswers - a.totalCorrectAnswers
    );
    return calculateScoresOnSorted(sorted);
  }
};
