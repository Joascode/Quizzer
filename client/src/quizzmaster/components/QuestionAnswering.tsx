import React, {
  FunctionComponent,
  Fragment,
  useState,
  useEffect,
  useRef,
} from 'react';
import { TeamModel, QuestionModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';
import data from 'emoji-mart/data/emojione.json';
import { EmojiData, NimblePicker, NimbleEmoji } from 'emoji-mart';

interface QuestionAnsweringProps {
  teams: TeamModel[];
  question: QuestionModel | undefined;
  // decideAnswer: (teamAnswer: TeamAnswerModel, correct: boolean) => void;
  closeQuestion: () => void;
  annoyTeam: (annoyance: any, teamId: string) => void;
}

interface TeamEmoji {
  teamId: string;
  emojiId: string;
  answerVersion: number;
}

export const QuestionAnswering: FunctionComponent<QuestionAnsweringProps> = (
  props,
) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }
  const [timeToClose, setTimeToClose] = useState(5);
  const [emojiPickerForTeam, setEmojiPickerForTeam] = useState<string>('');
  const [givenEmojis, setGivenEmojis] = useState<TeamEmoji[]>([]);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setTimeToClose(timeToClose - 1);
    }, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  });

  useDeepCompareMemoize(
    () => {
      let mounted = true;
      if (mounted) {
        setGivenEmojis(
          givenEmojis.filter((emoji) => {
            for (let team of props.teams) {
              if (
                team._id === emoji.teamId &&
                team.answer._version === emoji.answerVersion
              ) {
                return emoji;
              }
            }
          }),
        );
      }
      return () => {
        mounted = false;
      };
    },
    props.teams,
    givenEmojis,
  );

  const pokeTeam = (poke: string, teamId: string) => {
    props.annoyTeam(poke, teamId);
  };

  const closeQuestion = () => {
    props.closeQuestion();
  };

  const selectEmoji = (teamId: string, e: EmojiData, version: number) => {
    if (e.id) {
      let seen = false;
      const existingEmojis = givenEmojis.map((emoji) => {
        if (teamId === emoji.teamId && e.id) {
          seen = true;
          return {
            teamId: emoji.teamId,
            emojiId: e.id,
            answerVersion: version,
          };
        }
        return emoji;
      });
      setGivenEmojis(
        seen
          ? existingEmojis
          : [
              ...existingEmojis,
              { teamId: teamId, emojiId: e.id, answerVersion: version },
            ],
      );
      pokeTeam(e.id, teamId);
      setEmojiPickerForTeam('');
    }
  };

  return (
    <Fragment>
      <h1>Question time!</h1>
      <div>
        <h3>{props.question.question}</h3>
        <p>{props.question.answer}</p>
      </div>
      <ListGroup style={{ margin: '10px 0px' }}>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexFlow: 'column nowrap',
                }}
              >
                <p style={{ textAlign: 'left' }}>Team: {team.name}</p>
                <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
                  <p style={{ flex: '2 auto', textAlign: 'left' }}>
                    Answer: {team.answer.value}{' '}
                    {givenEmojis.map((emoji, index) => {
                      if (emoji.teamId === team._id) {
                        return (
                          <NimbleEmoji
                            key={index}
                            data={data}
                            set="emojione"
                            emoji={emoji.emojiId}
                            size={20}
                          />
                        );
                      }
                    })}
                  </p>
                  <NimbleEmoji
                    data={data}
                    emoji="grinning"
                    set="emojione"
                    size={20}
                    onClick={() =>
                      setEmojiPickerForTeam(
                        emojiPickerForTeam === team._id ? '' : team._id,
                      )
                    }
                  />
                  {emojiPickerForTeam === team._id ? (
                    <span>
                      <NimblePicker
                        data={data}
                        set="emojione"
                        onSelect={(e) =>
                          selectEmoji(team._id, e, team.answer._version)
                        }
                        title="Pick your emoji…"
                        emoji="point_up"
                        style={{
                          'z-index': '999',
                          right: '20px',
                          top: '80px',
                          position: 'absolute',
                        }}
                      />
                    </span>
                  ) : null}
                </div>
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <Button
        color="primary"
        disabled={timeToClose > 0}
        onClick={() => closeQuestion()}
      >
        {' '}
        {/* TODO: Activate button when every team has answered or when timer has ended */}
        {timeToClose > 0 ? timeToClose : 'Close Question'}
      </Button>
    </Fragment>
  );
};

function useDeepCompareMemoize(
  callback: () => void,
  teams: TeamModel[],
  emotes: TeamEmoji[],
) {
  if (!teamsAnswerEqual(teams, emotes)) {
    callback();
  }
}

function teamsAnswerEqual(newTeams: TeamModel[], emotes: TeamEmoji[]) {
  let equals = true;
  emotes.forEach((emote) => {
    newTeams.forEach((newTeam) => {
      if (emote.teamId === newTeam._id) {
        equals = emote.answerVersion === newTeam.answer._version;
      }
    });
  });
  return equals;
}
