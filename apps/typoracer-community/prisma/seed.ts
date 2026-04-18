import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, QuoteStatus } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  await prisma.attempt.deleteMany();
  await prisma.discussionReply.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.quote.deleteMany();

  const userRecords = await Promise.all(
    [
      {
        username: 'SpeedyFox',
        password: 'placeholder-password',
        joinedAt: new Date('2026-03-03T12:00:00.000Z'),
        bio: 'Competitive typer focused on quote mode and long-form consistency.',
      },
      {
        username: 'KeyMaster',
        password: 'placeholder-password',
        joinedAt: new Date('2026-02-11T12:00:00.000Z'),
        bio: 'Mechanical keyboard enthusiast who optimizes layouts and switch feel.',
      },
      {
        username: 'SwiftType',
        password: 'placeholder-password',
        joinedAt: new Date('2026-01-18T12:00:00.000Z'),
        bio: 'Interested in ranking systems, fairness, and sustainable speed training.',
      },
      {
        username: 'DeskCat',
        password: 'placeholder-password',
        joinedAt: new Date('2026-03-09T12:00:00.000Z'),
        bio: 'Casual forum regular with opinions on keyboards and ergonomics.',
      },
      {
        username: 'NovaKeys',
        password: 'placeholder-password',
        joinedAt: new Date('2026-03-14T12:00:00.000Z'),
        bio: 'Prefers practical setups over flashy gear.',
      },
    ].map((user) =>
      prisma.user.upsert({
        where: { username: user.username },
        update: user,
        create: user,
      }),
    ),
  );

  const users = new Map(userRecords.map((user) => [user.username, user.id]));

  const discussions = await Promise.all([
    prisma.discussion.create({
      data: {
        title: 'How do you improve accuracy past 98%?',
        excerpt:
          'I can hold 110 WPM for short bursts, but accuracy drops on punctuation-heavy quotes.',
        body: 'I can hold 110 WPM for short bursts, but accuracy drops on punctuation-heavy quotes. What drills actually help when the issue is not speed, but consistency on symbols and awkward transitions?',
        authorId: users.get('SpeedyFox')!,
      },
    }),
    prisma.discussion.create({
      data: {
        title: 'Best mechanical switch for long typing sessions?',
        excerpt:
          'Looking for something lighter than tactiles without going full mushy linear.',
        body: 'Looking for something lighter than tactiles without going full mushy linear. I type for work all day and then train in the evening, so fatigue matters more than sound.',
        authorId: users.get('KeyMaster')!,
      },
    }),
    prisma.discussion.create({
      data: {
        title: 'Should quotes mode rank by WPM or adjusted score?',
        excerpt:
          'Raw WPM rewards risky typing. Adjusted scoring might produce better competition.',
        body: 'Raw WPM rewards risky typing. Adjusted scoring might produce better competition, especially if the quote is long or punctuation-heavy. Curious what people think is fair.',
        authorId: users.get('SwiftType')!,
      },
    }),
  ]);

  await prisma.discussionReply.createMany({
    data: [
      {
        discussionId: discussions[0].id,
        authorId: users.get('KeyMaster')!,
        text: 'Slow down 5 to 10 WPM and train punctuation separately.',
      },
      {
        discussionId: discussions[0].id,
        authorId: users.get('SwiftType')!,
        text: 'Use quote-based practice instead of word lists. It exposes the exact mistakes.',
      },
      {
        discussionId: discussions[1].id,
        authorId: users.get('DeskCat')!,
        text: 'Light tactiles or medium linears are the safe middle ground.',
      },
      {
        discussionId: discussions[1].id,
        authorId: users.get('NovaKeys')!,
        text: 'More important than the switch: consistent keycaps and a comfortable angle.',
      },
      {
        discussionId: discussions[2].id,
        authorId: users.get('SpeedyFox')!,
        text: 'Adjusted score. Fast with errors should not beat clean typing.',
      },
    ],
  });

  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        authorId: users.get('SpeedyFox')!,
        image: '/assets/typewriter.jpg',
        alt: 'Old keyboard',
        text: 'Old keyboard',
        source: 'Community gallery',
        status: QuoteStatus.APPROVED,
      },
    }),
    prisma.quote.create({
      data: {
        authorId: users.get('KeyMaster')!,
        image: '/assets/mechanical-keyboard.webp',
        alt: 'Modern keyboard',
        text: 'Modern keyboard',
        source: 'Community gallery',
        status: QuoteStatus.APPROVED,
      },
    }),
    prisma.quote.create({
      data: {
        authorId: users.get('SwiftType')!,
        image: '/assets/an-image.jpg',
        alt: 'Generic',
        text: 'An image with description',
        source: 'Community gallery',
        status: QuoteStatus.APPROVED,
      },
    }),
    prisma.quote.create({
      data: {
        authorId: users.get('DeskCat')!,
        image: '/assets/an-image.jpg',
        alt: 'Generic',
        text: 'An image with description',
        source: 'Community gallery',
        status: QuoteStatus.APPROVED,
      },
    }),
    prisma.quote.create({
      data: {
        authorId: users.get('NovaKeys')!,
        image: '/assets/an-image.jpg',
        alt: 'Generic',
        text: 'An image with description',
        source: 'Community gallery',
        status: QuoteStatus.APPROVED,
      },
    }),
  ]);

  await prisma.attempt.createMany({
    data: [
      {
        quoteId: quotes[0].id,
        userId: users.get('SpeedyFox')!,
        wpm: 102,
        maxRawWpm: 109,
        accuracy: 99,
      },
      {
        quoteId: quotes[1].id,
        userId: users.get('SpeedyFox')!,
        wpm: 100,
        maxRawWpm: 106,
        accuracy: 98.6,
      },
      {
        quoteId: quotes[1].id,
        userId: users.get('KeyMaster')!,
        wpm: 97,
        maxRawWpm: 101,
        accuracy: 96,
      },
      {
        quoteId: quotes[2].id,
        userId: users.get('SwiftType')!,
        wpm: 93,
        maxRawWpm: 97,
        accuracy: 95,
      },
      {
        quoteId: quotes[3].id,
        userId: users.get('DeskCat')!,
        wpm: 88,
        maxRawWpm: 92,
        accuracy: 94,
      },
      {
        quoteId: quotes[4].id,
        userId: users.get('NovaKeys')!,
        wpm: 91,
        maxRawWpm: 95,
        accuracy: 97,
      },
    ],
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
