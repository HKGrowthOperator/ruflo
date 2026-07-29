import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getConfig, slugify, titleSimilarity, tokenContainment, tokenize,
} from '@tnr/shared';

test('slugify erhält tamilische kombinierende Zeichen', () => {
  const slug = slugify('சென்னை பேருந்து கட்டண உயர்வு', 'fallback');
  assert.equal(slug, 'சென்னை-பேருந்து-கட்டண-உயர்வு');
});

test('slugify fällt bei zu kurzem Ergebnis auf die ID zurück', () => {
  assert.equal(slugify('!!', 'sty_123'), 'sty_123');
});

test('Clustering: zweisprachiger Titel erreicht den Schwellwert', () => {
  const a = tokenize('சென்னை பெருநகர பேருந்து கட்டண உயர்வு அறிவிப்பு');
  const b = tokenize('Chennai bus fare hike announced: சென்னை பேருந்து கட்டண உயர்வு');
  assert.ok(titleSimilarity(a, b) >= getConfig().similarityThreshold);
});

test('Clustering: unterschiedliche Ereignisse bleiben getrennt', () => {
  const a = tokenize('சென்னை பெருநகர பேருந்து கட்டண உயர்வு அறிவிப்பு');
  const b = tokenize('கோவையில் புதிய தொழில்நுட்ப பூங்கா திறப்பு');
  assert.ok(titleSimilarity(a, b) < getConfig().similarityThreshold);
});

test('tokenContainment erkennt weitgehend übernommenen Quelltext', () => {
  const source = 'சென்னையில் பேருந்து கட்டணம் உயர்த்தப்படுவதாக போக்குவரத்து துறை அறிவித்துள்ளது';
  const copied = `செய்தி: ${source} — மேலும் விவரங்கள் விரைவில்.`;
  assert.ok(tokenContainment(source, copied) >= 0.8);
  assert.ok(tokenContainment(source, 'முற்றிலும் வேறு உள்ளடக்கம் இங்கே உள்ளது') < 0.3);
});
