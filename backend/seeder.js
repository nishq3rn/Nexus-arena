// seeder.js
// Seeds the NEXUS ARENA database with sample organizers, contenders, tournaments, and duels

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Registration = require('./models/Registration');
const Match = require('./models/Match');
const Leaderboard = require('./models/Leaderboard');
const Result = require('./models/Result');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[SEEDER] Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[SEEDER] Database connection failed: ${err.message}`);
    console.error('[SEEDER] Ensure your IP is whitelisted on MongoDB Atlas (Network Access -> Add 0.0.0.0/0).');
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Result.deleteMany();
    await Leaderboard.deleteMany();
    await Match.deleteMany();
    await Registration.deleteMany();
    await Tournament.deleteMany();
    await User.deleteMany();
    console.log('[SEEDER] All existing data successfully purged.');
  } catch (err) {
    console.error(`[SEEDER] Error purging data: ${err.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await destroyData();

    console.log('[SEEDER] Creating user accounts...');
    const organizer = await User.create({
      name: 'Nexus Official',
      email: 'organizer@nexusarena.gg',
      password: 'password123',
      role: 'organizer',
      phone: '+91 9876543210',
    });

    const player1 = await User.create({
      name: 'PhoenixV',
      email: 'phoenix@nexusarena.gg',
      password: 'password123',
      role: 'player',
      phone: '+91 9876500001',
    });

    const player2 = await User.create({
      name: 'GhostBlade',
      email: 'ghost@nexusarena.gg',
      password: 'password123',
      role: 'player',
      phone: '+91 9876500002',
    });

    const player3 = await User.create({
      name: 'ViperStrike',
      email: 'viper@nexusarena.gg',
      password: 'password123',
      role: 'player',
      phone: '+91 9876500003',
    });

    const player4 = await User.create({
      name: 'ReaperX',
      email: 'reaper@nexusarena.gg',
      password: 'password123',
      role: 'player',
      phone: '+91 9876500004',
    });

    console.log('[SEEDER] Creating competitive tournaments...');
    const tournaments = await Tournament.create([
      {
        name: 'CS2 Major Championship // Neo Arena',
        gameName: 'Counter-Strike 2',
        description: 'Elite 5v5 single-elimination tournament featuring 128-tick servers, MR12 regulation format, and official anti-cheat enforcement. Grand finals stream live on Nexus Twitch.',
        date: new Date(Date.now() + 86400000 * 3), // 3 days from now
        time: '18:00',
        venueType: 'Online',
        venueDetails: 'Nexus Mumbai 128T Dedicated Server Cluster',
        maxPlayers: 16,
        entryFee: 500,
        prizePool: 150000,
        status: 'Upcoming',
        organizer: organizer._id,
      },
      {
        name: 'Valorant Radiant Masters Season 4',
        gameName: 'Valorant',
        description: 'Premier tier tournament for Ascendant+ contenders. Best of 3 quarterfinals through semifinals, BO5 Grand Finals. Tournament map pool includes Ascent, Bind, and Haven.',
        date: new Date(Date.now() + 86400000 * 1), // 1 day from now
        time: '19:30',
        venueType: 'Online',
        venueDetails: 'Custom Lobby // Singapore 1',
        maxPlayers: 16,
        entryFee: 0,
        prizePool: 75000,
        status: 'Ongoing',
        organizer: organizer._id,
      },
      {
        name: 'Rocket League Supersonic Showdown',
        gameName: 'Rocket League',
        description: 'Standard 3v3 double elimination bracket. Competitive DFH Stadium and Champions Field. Full cross-play enabled across Steam, Epic, and consoles.',
        date: new Date(Date.now() + 86400000 * 5),
        time: '20:00',
        venueType: 'Online',
        venueDetails: 'Crossplay Server Lobby #09',
        maxPlayers: 16,
        entryFee: 250,
        prizePool: 40000,
        status: 'Upcoming',
        organizer: organizer._id,
      },
      {
        name: 'Dota 2 Aegis Regional Qualifier',
        gameName: 'Dota 2',
        description: 'Captains Mode tournament hosted by Nexus Arena. High-stakes clash for regional seed qualification into the International circuit.',
        date: new Date(Date.now() + 86400000 * 7),
        time: '17:00',
        venueType: 'Online',
        venueDetails: 'Valve SEA Match Server Cluster',
        maxPlayers: 8,
        entryFee: 1000,
        prizePool: 250000,
        status: 'Upcoming',
        organizer: organizer._id,
      },
      {
        name: 'Apex Legends Global Arena Clash',
        gameName: 'Apex Legends',
        description: 'Trios match point format spanning Worlds Edge and Storm Point. 6 rounds total with points awarded per kill and placement rank.',
        date: new Date(Date.now() + 86400000 * 2),
        time: '21:00',
        venueType: 'Online',
        venueDetails: 'Private Apex Custom Match Code',
        maxPlayers: 20,
        entryFee: 0,
        prizePool: 50000,
        status: 'Upcoming',
        organizer: organizer._id,
      },
      {
        name: 'League of Legends Baron Cup 2026',
        gameName: 'League of Legends',
        description: 'Concluded championship tournament on Summoner Rift patch 14.x. Certified standings archived in the Nexus Arena Hall of Fame.',
        date: new Date(Date.now() - 86400000 * 5),
        time: '16:00',
        venueType: 'Offline',
        venueDetails: 'Nexus Esports Stadium, Arena Floor #2',
        maxPlayers: 8,
        entryFee: 300,
        prizePool: 100000,
        status: 'Completed',
        organizer: organizer._id,
      },
    ]);

    const cs2Tournament = tournaments[0];
    const valTournament = tournaments[1];
    const lolTournament = tournaments[5];

    console.log('[SEEDER] Enrolling player registrations...');
    // Register players for CS2
    for (const p of [player1, player2, player3, player4]) {
      await Registration.create({
        tournament: cs2Tournament._id,
        player: p._id,
        status: 'Approved',
      });
      await Leaderboard.create({
        tournament: cs2Tournament._id,
        player: p._id,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        points: 0,
      });
    }

    // Register players for Valorant
    for (const p of [player1, player2, player3, player4]) {
      await Registration.create({
        tournament: valTournament._id,
        player: p._id,
        status: 'Approved',
      });
    }

    // Register players for completed LoL tournament
    for (const p of [player1, player2, player3, player4]) {
      await Registration.create({
        tournament: lolTournament._id,
        player: p._id,
        status: 'Approved',
      });
    }

    console.log('[SEEDER] Scheduling duel fixtures & results...');
    // Create match in Valorant (Ongoing)
    await Match.create({
      tournament: valTournament._id,
      round: 'Semifinals Duel',
      player1: player1._id,
      player2: player2._id,
      matchDate: new Date(),
      matchTime: '19:30',
      player1Score: 13,
      player2Score: 11,
      winner: player1._id,
      status: 'Completed',
    });

    await Leaderboard.create({
      tournament: valTournament._id,
      player: player1._id,
      matchesPlayed: 1,
      wins: 1,
      losses: 0,
      points: 3,
    });

    await Leaderboard.create({
      tournament: valTournament._id,
      player: player2._id,
      matchesPlayed: 1,
      wins: 0,
      losses: 1,
      points: 0,
    });

    await Match.create({
      tournament: valTournament._id,
      round: 'Grand Finals',
      player1: player1._id,
      player2: player3._id,
      matchDate: new Date(Date.now() + 3600000 * 2),
      matchTime: '21:00',
      status: 'Scheduled',
    });

    // Completed LoL tournament leaderboard & results
    await Leaderboard.create({
      tournament: lolTournament._id,
      player: player1._id,
      matchesPlayed: 3,
      wins: 3,
      losses: 0,
      points: 9,
    });
    await Leaderboard.create({
      tournament: lolTournament._id,
      player: player2._id,
      matchesPlayed: 3,
      wins: 2,
      losses: 1,
      points: 6,
    });
    await Leaderboard.create({
      tournament: lolTournament._id,
      player: player3._id,
      matchesPlayed: 3,
      wins: 1,
      losses: 2,
      points: 3,
    });
    await Leaderboard.create({
      tournament: lolTournament._id,
      player: player4._id,
      matchesPlayed: 3,
      wins: 0,
      losses: 3,
      points: 0,
    });

    await Result.create({
      tournament: lolTournament._id,
      champion: player1._id,
      runnerUp: player2._id,
      thirdPosition: player3._id,
      finalRankings: [
        { player: player1._id, rank: 1, points: 9 },
        { player: player2._id, rank: 2, points: 6 },
        { player: player3._id, rank: 3, points: 3 },
        { player: player4._id, rank: 4, points: 0 },
      ],
      publishedAt: new Date(),
    });

    console.log('----------------------------------------------------');
    console.log('✅ NEXUS ARENA SEED DATA CREATED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Organizer account:  organizer@nexusarena.gg  /  password123');
    console.log('Player accounts:    phoenix@nexusarena.gg    /  password123');
    console.log('                    ghost@nexusarena.gg      /  password123');
    console.log('                    viper@nexusarena.gg      /  password123');
    console.log('                    reaper@nexusarena.gg     /  password123');
    console.log('Tournaments seeded: 6 competitive directives ready');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error(`[SEEDER] Import error: ${err.message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
    await destroyData();
    process.exit(0);
  } else {
    await importData();
  }
};

run();
