import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfferFromLead, setStatus } from '../src/offer.mjs';
import { dueFollowUps, runFollowUps } from '../src/followup.mjs';

function versendetesAngebot(versendetVorTagen) {
  const offer = createOfferFromLead(
    { firma: 'Old Rocket', email: 'kontakt@oldrocket.de', beschreibung: 'x' },
    { leistung: 'Website Relaunch', preis: 4900, zahlungsmodell: '50/50', lieferzeit: '3 Wochen' },
    []
  );
  setStatus(offer, 'geprueft');
  setStatus(offer, 'versendet');
  offer.versendetAm = new Date(Date.now() - versendetVorTagen * 86400000).toISOString();
  return offer;
}

test('Keine Follow-ups vor Tag 3', () => {
  assert.deepEqual(dueFollowUps(versendetesAngebot(2)), []);
});

test('Tag 3: Erinnerung fällig', () => {
  assert.deepEqual(dueFollowUps(versendetesAngebot(3)), ['erinnerung']);
});

test('Tag 7: Erinnerung und Vertriebsaufgabe fällig', () => {
  assert.deepEqual(dueFollowUps(versendetesAngebot(8)), ['erinnerung', 'vertriebsaufgabe']);
});

test('Entschiedene Angebote bekommen keine Follow-ups', () => {
  const offer = versendetesAngebot(10);
  setStatus(offer, 'gewonnen');
  assert.deepEqual(dueFollowUps(offer), []);
});

test('runFollowUps erzeugt Outbox-Mail und Aufgabe genau einmal', () => {
  const offer = versendetesAngebot(8);
  const offers = [offer];

  const erste = runFollowUps(offers);
  assert.equal(erste.outbox.length, 1);
  assert.equal(erste.aufgaben.length, 1);
  assert.match(erste.outbox[0].betreff, /Erinnerung/);
  assert.equal(erste.outbox[0].an, 'kontakt@oldrocket.de');
  assert.match(erste.aufgaben[0].titel, /Nachfassen/);

  // Zweiter Lauf darf nichts doppelt erzeugen
  const zweite = runFollowUps(offers);
  assert.equal(zweite.outbox.length, 0);
  assert.equal(zweite.aufgaben.length, 0);
});
