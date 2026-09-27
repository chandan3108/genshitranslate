const fs = require('fs');

const API_URL = 'http://localhost:3000/api/translate';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scenarios = [
  {
    name: 'Scenario 1: Konbini Checkout Flow (Subject Omission & Point Cards)',
    situation: 'konbini',
    turns: [
      { input: '袋はご利用ですか？' },
      { input: 'No thank you, I have my own bag.' },
      { input: 'ポイントカードはお持ちですか？' },
      { input: 'I do not have one.' },
      { input: '温めますか？' },
      { input: '画面の確認ボタンを押してください。' },
      { input: 'Can I pay using Suica?' }
    ]
  },
  {
    name: 'Scenario 2: Izakaya Nuance & Etiquette (-te mitai & Otoshi)',
    situation: 'izakaya',
    turns: [
      { input: 'I want to try drinking Japanese sake for the first time.' },
      { input: 'こちらお通しになります。' },
      { input: 'ラストオーダーになりますが、追加はございますか？' },
      { input: 'お会計はご一緒でよろしいですか？' },
      { input: 'Can we pay separately?' }
    ]
  },
  {
    name: 'Scenario 3: Station IC Gate Emergency',
    situation: 'train',
    turns: [
      { input: '改札でピンポンと音が鳴って出られません。' },
      { input: 'My IC card gave an error at the ticket gate.' },
      { input: '新幹線の指定席は何号車ですか？' }
    ]
  }
];

async function runTurn(situation, history, currentInput) {
  const start = Date.now();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: currentInput,
      speaker: 'auto',
      situation: situation,
      history: history
    })
  });
  const duration = Date.now() - start;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  const data = await res.json();
  return { data, duration };
}

async function runStressTest() {
  console.log('====================================================');
  console.log('🚀 GENSHI REAL-WORLD STRESS TEST');
  console.log('====================================================\n');

  let totalTurns = 0;
  let totalLatency = 0;
  let successCount = 0;

  for (const scen of scenarios) {
    console.log(`\n📌 RUNNING: ${scen.name}`);
    console.log('----------------------------------------------------');
    const rollingHistory = [];

    for (let i = 0; i < scen.turns.length; i++) {
      const turnReq = scen.turns[i];
      try {
        const { data, duration } = await runTurn(
          scen.situation,
          rollingHistory,
          turnReq.input
        );

        totalTurns++;
        totalLatency += duration;
        successCount++;

        console.log(`  Turn ${i + 1} (${duration}ms) [Detected: ${data.detectedSpeaker?.toUpperCase()}]:`);
        console.log(`    Input:    "${turnReq.input}"`);
        console.log(`    JA:       ${data.japanese}`);
        console.log(`    Romaji:   ${data.romaji}`);
        console.log(`    EN:       ${data.english}`);
        if (data.situationalIntent) {
          console.log(`    Intent:   💡 ${data.situationalIntent.slice(0, 90)}...`);
        }
        if (data.nuance) {
          console.log(`    Nuance:   🔍 ${data.nuance.slice(0, 90)}...`);
        }
        if (data.suggestedReplies && data.suggestedReplies.length > 0) {
          console.log(`    Replies:  [${data.suggestedReplies.map(r => r.label).join(' | ')}]`);
        }
        console.log('');

        // Append to rolling history
        rollingHistory.push({
          speaker: data.detectedSpeaker || 'tourist',
          input: turnReq.input,
          japanese: data.japanese,
          english: data.english,
          situationalIntent: data.situationalIntent
        });

        // 2 second conversational pacing between turns
        await sleep(2500);

      } catch (err) {
        console.error(`  ❌ Turn ${i + 1} Failed:`, err.message);
        await sleep(5000);
      }
    }
  }

  const avgLatency = Math.round(totalLatency / (totalTurns || 1));
  console.log('====================================================');
  console.log('📊 STRESS TEST RESULTS');
  console.log(`Total Turns Tested: ${totalTurns}`);
  console.log(`Success Rate:      ${((successCount / totalTurns) * 100).toFixed(1)}%`);
  console.log(`Average Latency:   ${avgLatency}ms`);
  console.log('====================================================');
}

runStressTest();
