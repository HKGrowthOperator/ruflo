import test from 'node:test';
import assert from 'node:assert/strict';
import { extractHeuristic, parsePreis, parseZahlungsmodell, parseLieferzeit } from '../src/extract.mjs';

test('Heuristik erkennt das Beispiel aus der Lektion (Website Relaunch, 4.500 €, 50/50, 3 Wochen)', () => {
  const text = 'Kunde möchte einen Website Relaunch. Budget: 4.500 €, Zahlung 50/50, Lieferzeit 3 Wochen.';
  const e = extractHeuristic(text);
  assert.equal(e.leistung, 'Website Relaunch');
  assert.equal(e.preis, 4500);
  assert.equal(e.zahlungsmodell, '50/50');
  assert.equal(e.lieferzeit, '3 Wochen');
  assert.equal(e.methode, 'heuristik');
});

test('Preis-Parser versteht deutsche Formate', () => {
  assert.equal(parsePreis('Budget 4.900 €'), 4900);
  assert.equal(parsePreis('ca. 4500€'), 4500);
  assert.equal(parsePreis('EUR 12.500'), 12500);
  assert.equal(parsePreis('1.234,56 €'), 1234.56);
  assert.equal(parsePreis('kein Preis genannt'), null);
});

test('Zahlungsmodell-Parser', () => {
  assert.equal(parseZahlungsmodell('Zahlung 50 / 50 wie üblich'), '50/50');
  assert.equal(parseZahlungsmodell('30 % Anzahlung, Rest später'), '30 % Anzahlung');
  assert.equal(parseZahlungsmodell('Zahlung bei Fertigstellung'), 'Zahlung bei Fertigstellung');
  assert.equal(parseZahlungsmodell('nichts dazu gesagt'), null);
});

test('Lieferzeit-Parser normalisiert Einheiten', () => {
  assert.equal(parseLieferzeit('in 3 Wochen fertig'), '3 Wochen');
  assert.equal(parseLieferzeit('Umsetzung 1 Woche'), '1 Woche');
  assert.equal(parseLieferzeit('dauert 2 Monate'), '2 Monate');
  assert.equal(parseLieferzeit('innerhalb von 10 Tagen'), '10 Tage');
  assert.equal(parseLieferzeit('keine Angabe'), null);
});

test('WhatsApp-artige Notiz wird sinnvoll extrahiert', () => {
  const text = 'Hey, die wollen nen neuen Onlineshop, hatte denen 8.000€ gesagt, die Hälfte vorab als 50/50, soll in 6 Wochen stehen';
  const e = extractHeuristic(text);
  assert.equal(e.leistung, 'Onlineshop');
  assert.equal(e.preis, 8000);
  assert.equal(e.zahlungsmodell, '50/50');
  assert.equal(e.lieferzeit, '6 Wochen');
});
