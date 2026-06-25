import {
  batchEmbed,
  embedOne,
  EMBED_DIMENSIONS,
  EMBED_MODEL,
  CHAT_MODEL,
  VISION_MODEL,
  generate,
  generateStream,
  visionExtract,
} from '../src/lib/gemini';

async function testBatchEmbed() {
  console.log(`\n[1/4] batchEmbed (model=${EMBED_MODEL})`);
  const inputs = [
    'The quick brown fox jumps over the lazy dog.',
    'TypeScript is a strongly typed programming language.',
    'pgvector enables vector similarity search inside Postgres.',
  ];
  const vectors = await batchEmbed(inputs);
  console.log(`  -> ${vectors.length} vectors, each ${vectors[0]?.length} dims`);
  if (vectors.length !== inputs.length) throw new Error('count mismatch');
  if (vectors[0].length !== EMBED_DIMENSIONS)
    throw new Error(`expected ${EMBED_DIMENSIONS} dims, got ${vectors[0].length}`);
  console.log('  ✅ batchEmbed works');
}

async function testEmbedOne() {
  console.log(`\n[2/4] embedOne (single query embedding)`);
  const v = await embedOne('What is the capital of France?');
  console.log(`  -> ${v.length} dims, first 3 values: [${v.slice(0, 3).map((x) => x.toFixed(4)).join(', ')}...]`);
  console.log('  ✅ embedOne works');
}

async function testGenerate() {
  console.log(`\n[3/4] generate + generateStream (model=${CHAT_MODEL})`);
  const reply = await generate('Reply in exactly 5 words: what is RAG?');
  console.log(`  -> non-stream: "${reply.trim()}"`);

  process.stdout.write('  -> stream:    "');
  for await (const chunk of generateStream('Count from 1 to 5, one number per line.')) {
    process.stdout.write(chunk);
  }
  process.stdout.write('"\n');
  console.log('  ✅ generate + stream work');
}

async function testVision() {
  console.log(`\n[4/4] visionExtract (model=${VISION_MODEL})`);
  // 1x1 red PNG as base64 — tiny test image
  const redPx = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );
  const text = await visionExtract(redPx, 'image/png');
  console.log(`  -> "${text.trim().slice(0, 150)}${text.length > 150 ? '...' : ''}"`);
  console.log('  ✅ visionExtract works');
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env.local');
    process.exit(1);
  }
  await testBatchEmbed();
  await testEmbedOne();
  await testGenerate();
  await testVision();
  console.log('\n🎉 All Gemini wrapper tests passed.');
}

main().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
