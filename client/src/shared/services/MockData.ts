import { Team } from '../../quizzteam/components/Team';

interface MockDataModel {
  id: number;
  host: string;
  name: string;
  password: string;
  teams: Team[];
  rounds: any[];
  currentRound: any;
}

export const MockData: MockDataModel = {
  id: 1,
  host: 'Boontje',
  name: `Boontje's game`,
  password: 'boontje',
  teams: [],
  rounds: [],
  currentRound: {},
};
