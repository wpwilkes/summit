#!/usr/bin/env bash
set -Eeuo pipefail

# Run from anywhere on the Lightsail instance, with the Summit repository present.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${SUMMIT_ENV_FILE:-.env.production}"
CREDS_FILE="${SUMMIT_SEED_CREDS:-.env.demo-seed}"
COMPOSE_FILE="${SUMMIT_COMPOSE_FILE:-compose.backend.yaml}"

for f in "$ENV_FILE" "$CREDS_FILE" "$COMPOSE_FILE"; do
  [[ -f "$f" ]] || { echo "Missing $f" >&2; exit 1; }
done

# Special account emails and passwords must not be checked into Git.
set -a
# shellcheck disable=SC1090
source "$CREDS_FILE"
set +a
for v in WESLEY_EMAIL WESLEY_PASSWORD AYMAN_EMAIL AYMAN_PASSWORD KHAN_EMAIL KHAN_PASSWORD JALAL_EMAIL JALAL_PASSWORD; do
  [[ -n "${!v:-}" ]] || { echo "Missing $v in $CREDS_FILE" >&2; exit 1; }
done

DC=(sudo docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")
"${DC[@]}" ps --status running --services | grep -qx db || { echo 'PostgreSQL is not running.' >&2; exit 1; }
"${DC[@]}" ps --status running --services | grep -qx server || { echo 'Express server is not running.' >&2; exit 1; }

cat <<'WARNING'
WARNING: DESTRUCTIVE DATABASE RESET
This will remove ALL existing Summit users, communities, posts, comments,
replies, votes, memberships, and summaries in the configured database.
WARNING
read -r -p 'Type RESET SUMMIT DEMO to permanently replace the data: ' confirm
[[ "$confirm" == 'RESET SUMMIT DEMO' ]] || { echo 'Cancelled.'; exit 1; }

echo 'Seeding database (this may take a little while) ...'
"${DC[@]}" exec -T \
  -e WESLEY_EMAIL="$WESLEY_EMAIL" \
  -e WESLEY_PASSWORD="$WESLEY_PASSWORD" \
  -e AYMAN_EMAIL="$AYMAN_EMAIL" \
  -e AYMAN_PASSWORD="$AYMAN_PASSWORD" \
  -e KHAN_EMAIL="$KHAN_EMAIL" \
  -e KHAN_PASSWORD="$KHAN_PASSWORD" \
  -e JALAL_EMAIL="$JALAL_EMAIL" \
  -e JALAL_PASSWORD="$JALAL_PASSWORD" \
  server node --input-type=module <<'JAVASCRIPT'
import pg from 'pg';
import argon2 from 'argon2';
import crypto from 'node:crypto';

const { Pool } = pg;
const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
const pool = new Pool({
  host: POSTGRES_HOST, port: Number(POSTGRES_PORT || 5432),
  user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB,
  max: 2,
});
const client = await pool.connect();

// Repeatable pseudo-random content; cryptographically random hashing remains unique.
let state = 20261111;
function rand() { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; }
function pick(a) { return a[Math.floor(rand() * a.length)]; }
function ri(min, max) { return min + Math.floor(rand() * (max - min + 1)); }
const timeAgo = (days, hours = 0) => new Date(Date.now() - days * 86400000 - hours * 3600000);
const given = ['Alex','Morgan','Taylor','Jordan','Casey','Riley','Sam','Jamie','Drew','Avery','Cameron','Quinn','Reese','Skyler','Noah','Emma','Maya','Ethan','Sofia','Liam','Harper','Olivia','Grace','Dylan','Parker','Blake','Aria','Logan','Elliot','Nora'];
const surnames = ['Morgan','Walker','Patel','Brown','Chen','Adams','Rivera','Kim','Hughes','Reed','Bennett','Cooper','Bell','Turner','Davis','Brooks','Murphy','Foster','Nguyen','Ortiz','Price','Coleman'];
const communities = [
 ['Ask Summit','General','Questions','Questions, advice, and useful answers from the community.'],
 ['Technology','Technology','General','Computing, hardware, software, and digital life.'],
 ['Programming','Technology','Software','Languages, tools, architecture, and debugging.'],
 ['Web Development','Technology','Web','Frontend, backend, accessibility, and deployment.'],
 ['Linux','Technology','Operating Systems','Linux administration, shell tips, and servers.'],
 ['Gaming','Entertainment','Gaming','Games, consoles, and memorable playthroughs.'],
 ['Books','Culture','Literature','What we are reading and recommending.'],
 ['History','Humanities','History','Historical research, sources, and discussion.'],
 ['Philosophy','Humanities','Philosophy','Reasoning about ethics, knowledge, and meaning.'],
 ['Mathematics','Science','Mathematics','Math questions and mathematical ideas.'],
 ['Science','Science','General','Research, science communication, and discoveries.'],
 ['Space','Science','Astronomy','Astronomy, exploration, and observing the night sky.'],
 ['Cooking','Lifestyle','Food','Recipes, techniques, and meal planning.'],
 ['Fitness','Lifestyle','Health & Fitness','Training, movement, and healthy routines.'],
 ['Outdoors','Lifestyle','Nature','Hiking, camping, and time outdoors.'],
 ['Photography','Arts','Photography','Photos, equipment, and composition.'],
 ['Music','Arts','Music','Albums, instruments, and live performances.'],
 ['Movies','Entertainment','Film','Films, directors, and recommendations.'],
 ['Travel','Lifestyle','Travel','Trip reports, itineraries, and local recommendations.'],
 ['Personal Finance','Lifestyle','Finance','Budgeting, saving, and financial decisions.'],
 ['College Life','Education','University','Campus experiences, assignments, and study habits.'],
 ['Career Advice','Education','Careers','Work, interviews, and professional growth.'],
 ['Pets','Lifestyle','Animals','Pet stories, care, and advice.'],
 ['Gardening','Lifestyle','Home & Garden','Plants, gardening projects, and growing tips.'],
 ['Louisiana','Local','Regional','Local food, places, events, and community updates.'],
];
const headlines = [
 'What would you recommend to someone just getting started?',
 'A small project that turned out better than expected',
 'What are you working on this week?',
 'Lessons learned after trying this for a month',
 'Does anyone have a good beginner-friendly resource?',
 'Three things I wish I knew sooner',
 'Help me choose between these two approaches',
 'What is a common misconception about this topic?',
 'A few notes from a recent experiment',
 'How do you keep improving without burning out?',
 'Thoughts on the latest changes in this space?',
 'Share your favorite practical tip',
 'Weekend discussion: what surprised you lately?',
 'What is worth investing more time in?',
 'An update on my progress and next steps',
 'Could use a second opinion on this plan',
];
const postBodies = [
 'I have been exploring this for the last few weeks and would like to hear how other people approach it. What has worked for you in practice?',
 'Here is what I tried: I started with the simplest option, documented the results, and made one change at a time. It helped me figure out what actually mattered.',
 'There are several reasonable approaches, and I am having trouble deciding which trade-offs are worth accepting. I would appreciate specific examples.',
 'I collected a few useful resources and wrote down the most important takeaways. Happy to compare notes with anyone who has experience in this area.',
 'My first attempt was not great, but I learned quite a bit. The biggest improvement came from focusing on consistency and asking better questions.',
 'I am planning a small weekend project and would love suggestions for the scope, tools, and common mistakes to avoid.',
];
const responses = [
 'This is a good question. I would start with a smaller example before investing too much time.',
 'I tried something similar last year. The biggest lesson was to keep the process simple and document what changed.',
 'Can you share a little more context? The best answer probably depends on your goals.',
 'That matches my experience. One small adjustment made a bigger difference than I expected.',
 'I see the appeal, but I think there is a trade-off worth considering here.',
 'Thanks for posting this. It helped me look at the problem from a different angle.',
 'For anyone starting out, I would recommend testing a few options and comparing the results.',
 'Interesting point. Do you have a source or example that illustrates it?',
 'I disagree slightly: that approach works well in some circumstances, but not in every case.',
 'The practical details matter a lot here. What happened when you tried the alternative?',
 'I would love to see a follow-up after you have had another week to experiment.',
 'A helpful way to frame this is to separate what is necessary from what is merely convenient.',
 'We ran into the same issue in a class project, and a small prototype helped us resolve it.',
 'The explanation is clear. One thing I would add is to consider maintenance over time.',
 'That is worth trying. I have had good results with a similar workflow.',
 'Another perspective: the learning curve may matter more than the initial result.',
];

async function many(table, cols, rows) {
  if (!rows.length) return [];
  const vals = [];
  const args = [];
  let n = 1;
  for (const row of rows) {
    args.push('(' + row.map(value => { vals.push(value); return '$' + n++; }).join(',') + ')');
  }
  const q = `INSERT INTO ${table} (${cols.join(',')}) VALUES ${args.join(',')} RETURNING id`;
  const result = await client.query(q, vals);
  return result.rows.map(r => r.id);
}
async function manyVoid(table, cols, rows) {
  if (!rows.length) return;
  const vals = [];
  let n = 1;
  const args = rows.map(row => '(' + row.map(v => { vals.push(v); return '$' + n++; }).join(',') + ')');
  await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES ${args.join(',')}`, vals);
}
const qualifiers = ['For a class project,','In my experience,','From a practical perspective,','After trying several options,','For beginners,','Given the constraints,','As a follow-up,','Looking at the bigger picture,','One detail that stands out:','In a small team,'];
const questions = ['Has anyone tested this with a different approach?','I would be interested in hearing how it works after a few weeks.','What evidence would change your mind?','There may be a simpler way to verify that assumption.','I think a short comparison would clarify the trade-offs.','It would help to include a concrete example.','I am curious whether the same advice applies at a larger scale.'];
function replyText(community) { return `${pick(qualifiers)} ${pick(responses)} ${pick(questions)} (${community} discussion.)`; }

const special = [
 ['Wesley',process.env.WESLEY_EMAIL,process.env.WESLEY_PASSWORD],
 ['Ayman',process.env.AYMAN_EMAIL,process.env.AYMAN_PASSWORD],
 ['Khan',process.env.KHAN_EMAIL,process.env.KHAN_PASSWORD],
 ['Jalal',process.env.JALAL_EMAIL,process.env.JALAL_PASSWORD],
];

try {
  await client.query('BEGIN');
  await client.query(`TRUNCATE TABLE
    "comment_votes", "post_votes", "community_memberships", "summaries",
    "comments", "posts", "communities", "users"
    RESTART IDENTITY CASCADE`);

  const people = [];
  for (const [username,email,password] of special) {
    people.push([username,email,await argon2.hash(password),crypto.randomBytes(24).toString('hex'),true,timeAgo(ri(7,120))]);
  }
  for (let i=0;i<100;i++) {
    const first = pick(given), last = pick(surnames);
    // Unique, unrecorded cryptographically random password for each synthetic account.
    const randomPasswordHash = await argon2.hash(crypto.randomBytes(32).toString('base64url'));
    const randomEmail = `demo-${crypto.randomBytes(16).toString('hex')}@example.test`;
    people.push([`demo_${String(i+1).padStart(3,'0')}_${first.toLowerCase()}`,
      randomEmail, randomPasswordHash,
      crypto.randomBytes(24).toString('hex'),true,timeAgo(ri(5,150))]);
  }
  const users = await many('users', ['username','email','password_hash','code_hash','"emailVerified"','created_at'], people);
  console.log(`Created ${users.length} verified users`);

  const communityRows = communities.map(([name,topic,subtopic,description],i) =>
    [name,description,topic,subtopic,users[i%users.length],timeAgo(ri(30,150))]);
  const communityIds = await many('communities', ['name','description','topic','subtopic','creator_id','created_at'], communityRows);
  const memberships=[];
  for (let c=0;c<communityIds.length;c++) {
    const memberSet=new Set([users[c]]);
    while(memberSet.size<ri(24,55)) memberSet.add(pick(users));
    for(const u of memberSet) memberships.push([u,communityIds[c],timeAgo(ri(0,70))]);
  }
  // Memberships use a composite (user_id, community_id) primary key.
  for(let i=0;i<memberships.length;i+=250) {
    await manyVoid('community_memberships',['user_id','community_id','joined_at'],memberships.slice(i,i+250));
  }
  console.log(`Created ${communityIds.length} communities and ${memberships.length} memberships`);

  const posts=[];
  for (let i=0;i<100;i++) {
    const c = i<25 ? i : ri(0,24); // guarantee every community gets a post
    const title = `${pick(headlines)} — ${communities[c][0]}`;
    const body = `${pick(postBodies)}\n\nTopic: ${communities[c][0]}. What would you do differently?`;
    posts.push([pick(users), communityIds[c], title, body, 0, timeAgo(ri(1,105),ri(0,23))]);
  }
  const postIds = await many('posts',['author_id','community_id','title','body','vote','created_at'],posts);
  console.log(`Created ${postIds.length} posts`);

  const commentIds=[];
  let totalComments=0;
  for(let i=0;i<postIds.length;i++) {
    // Adjacent pairs sum to 200: exactly 10,000 comments / 100 posts.
    const size = i%2===0 ? (70+ri(0,60)) : (200 - previousSize);
    if (i%2===0) var previousSize=size;
    const all=[];
    const originalDate = posts[i][5];
    const communityName = communities[communityIds.indexOf(posts[i][1])][0];
    let remaining=size;
    let depth=0;
    while(remaining>0) {
      const batchSize=Math.min(depth===0 ? 15 : 28,remaining);
      const rows=[];
      for(let j=0;j<batchSize;j++) {
        let parent=null;
        if(depth>0 && rand()<0.93) parent=pick(all);
        const when = new Date(Math.max(originalDate.getTime()+3600000,Date.now()-ri(0,70)*86400000));
        rows.push([postIds[i],pick(users),parent,replyText(communityName),0,when]);
      }
      const inserted=await many('comments',['post_id','author_id','parent_id','body','vote','created_at'],rows);
      all.push(...inserted);
      commentIds.push(...inserted);
      totalComments+=inserted.length;
      remaining-=batchSize;
      depth++;
    }
    if((i+1)%20===0) console.log(`Comments: ${i+1} / 100 posts`);
  }
  console.log(`Created ${totalComments} comments and replies`);

  // Populate coherent votes and precomputed vote scores.
  const postVoteRows=[];
  const postScores=new Map();
  for(const id of postIds) {
    let sum=0;
    const voters=new Set();
    const count=ri(5,26);
    while(voters.size<count) voters.add(pick(users));
    for(const u of voters) {
      const value=rand()<0.83 ? 1 : -1;
      sum+=value;
      postVoteRows.push([id,u,value]);
    }
    postScores.set(id,sum);
  }
  for(let i=0;i<postVoteRows.length;i+=300) {
    await manyVoid('post_votes',['post_id','user_id','value'],postVoteRows.slice(i,i+300));
  }
  for(const [id,sum] of postScores) await client.query('UPDATE posts SET vote=$1 WHERE id=$2',[sum,id]);

  const commentVoteRows=[];
  const commentScores=new Map();
  for(const id of commentIds) {
    if(rand()<0.36) {
      const voters=new Set();
      const count=ri(1,3);
      while(voters.size<count) voters.add(pick(users));
      let sum=0;
      for(const u of voters) {
        const value=rand()<0.8?1:-1;
        sum+=value;
        commentVoteRows.push([id,u,value]);
      }
      commentScores.set(id,sum);
    }
  }
  for(let i=0;i<commentVoteRows.length;i+=250) {
    await manyVoid('comment_votes',['comment_id','user_id','value'],commentVoteRows.slice(i,i+250));
  }
  // Batch updates to avoid thousands of database round trips.
  const scoreEntries=[...commentScores];
  for(let i=0;i<scoreEntries.length;i+=250) {
    const slice=scoreEntries.slice(i,i+250);
    const params=slice.flatMap(([id,score])=>[id,score]);
    const values=slice.map((_,j)=>`($${2*j+1}::integer,$${2*j+2}::integer)`).join(',');
    await client.query(`UPDATE comments c SET vote=v.score FROM (VALUES ${values}) AS v(id,score) WHERE c.id=v.id`,params);
  }
  await client.query('COMMIT');
  const r=await client.query(`SELECT
    (SELECT count(*) FROM users) users,
    (SELECT count(*) FROM users WHERE "emailVerified") verified,
    (SELECT count(*) FROM communities) communities,
    (SELECT count(*) FROM posts) posts,
    (SELECT count(*) FROM comments) comments,
    (SELECT count(*) FROM comments WHERE parent_id IS NOT NULL) replies,
    (SELECT count(*) FROM post_votes) post_votes,
    (SELECT count(*) FROM comment_votes) comment_votes`);
  console.log('Seed completed:', r.rows[0]);
  console.log('Special accounts created and verified:',special.map(([username])=>username).join(', '));
} catch(error) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error('Seeding failed. Database transaction rolled back:',error);
  process.exitCode=1;
} finally {
  client.release();
  await pool.end();
}
JAVASCRIPT

echo "Done. No backup was created."
echo 'The existing /uploads volume has not been erased.'
