import { Injectable } from '@nestjs/common';
import {
  CreateDiscussionReply,
  Discussion,
  DiscussionReply,
} from './discussions.models';

const discussions: Discussion[] = [
  {
    id: 1,
    title: 'How do you improve accuracy past 98%?',
    author: 'SpeedyFox',
    excerpt:
      'I can hold 110 WPM for short bursts, but accuracy drops on punctuation-heavy quotes.',
    body: 'I can hold 110 WPM for short bursts, but accuracy drops on punctuation-heavy quotes. What drills actually help when the issue is not speed, but consistency on symbols and awkward transitions?',
    replies: [
      {
        author: 'KeyMaster',
        text: 'Slow down 5 to 10 WPM and train punctuation separately.',
      },
      {
        author: 'SwiftType',
        text: 'Use quote-based practice instead of word lists. It exposes the exact mistakes.',
      },
    ],
  },
  {
    id: 2,
    title: 'Best mechanical switch for long typing sessions?',
    author: 'KeyMaster',
    excerpt:
      'Looking for something lighter than tactiles without going full mushy linear.',
    body: 'Looking for something lighter than tactiles without going full mushy linear. I type for work all day and then train in the evening, so fatigue matters more than sound.',
    replies: [
      {
        author: 'DeskCat',
        text: 'Light tactiles or medium linears are the safe middle ground.',
      },
      {
        author: 'NovaKeys',
        text: 'More important than the switch: consistent keycaps and a comfortable angle.',
      },
    ],
  },
  {
    id: 3,
    title: 'Should quotes mode rank by WPM or adjusted score?',
    author: 'SwiftType',
    excerpt:
      'Raw WPM rewards risky typing. Adjusted scoring might produce better competition.',
    body: 'Raw WPM rewards risky typing. Adjusted scoring might produce better competition, especially if the quote is long or punctuation-heavy. Curious what people think is fair.',
    replies: [
      {
        author: 'SpeedyFox',
        text: 'Adjusted score. Fast with errors should not beat clean typing.',
      },
    ],
  },
];

@Injectable()
export class DiscussionsService {
  getDiscussions(): Discussion[] {
    return discussions;
  }

  getDiscussionById(discussionId: number): Discussion | undefined {
    return discussions.find((discussion) => discussion.id === discussionId);
  }

  getDiscussionsByAuthor(username: string): Discussion[] {
    return discussions.filter((discussion) => discussion.author === username);
  }

  addReply(
    discussionId: number,
    reply: CreateDiscussionReply,
  ): DiscussionReply | undefined {
    const discussion = discussions.find((item) => item.id === discussionId);

    if (!discussion) {
      return undefined;
    }

    const nextReply: DiscussionReply = {
      author: reply.author.trim(),
      text: reply.text.trim(),
    };

    discussion.replies.push(nextReply);

    return nextReply;
  }
}
