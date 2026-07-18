import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  RELEVANCE_DISCARD_BELOW, classifyRisk, scoreRelevance,
} from '@tnr/shared';

test('direkter Tamil-Bezug + DACH-Ort ergibt hohen Score', () => {
  const s = scoreRelevance({
    text: 'Tamilische Gemeinde in Dortmund kündigt Tempelfest an',
    publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    sourceTrust: 80,
  });
  assert.equal(s.tamil, 30);
  assert.equal(s.dach, 20);
  assert.ok(s.total >= 80, `Score ${s.total} sollte >= 80 sein`);
});

test('Meldung ohne jeden Tamil-Bezug fällt unter die Verwerfen-Schwelle', () => {
  const s = scoreRelevance({
    text: 'Bundesliga: Ergebnisse vom Wochenende',
    sourceTrust: 60,
  });
  assert.ok(s.total < RELEVANCE_DISCARD_BELOW, `Score ${s.total} sollte < ${RELEVANCE_DISCARD_BELOW} sein`);
});

test('indirekter Bezug (Sri Lanka) gibt Teilpunkte', () => {
  const s = scoreRelevance({ text: 'Sri Lanka öffnet neue Fährverbindung', sourceTrust: 70 });
  assert.equal(s.tamil, 15);
});

test('Risikoklassen: Politik/Tod → gelb, Gerücht → rot, Event → grün', () => {
  assert.equal(classifyRisk('Demonstration vor dem Gericht nach umstrittenem Urteil'), 'yellow');
  assert.equal(classifyRisk('Nach unbestätigten Berichten soll angeblich ein Vorfall...'), 'red');
  assert.equal(classifyRisk('Tamilisches Kulturfestival mit Musik und Tanz in Köln'), 'green');
});
