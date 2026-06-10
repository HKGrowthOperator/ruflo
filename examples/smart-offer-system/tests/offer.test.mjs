import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfferFromLead, nextOfferNumber, setStatus, dashboardStats, calcSumme } from '../src/offer.mjs';

const lead = {
  firma: 'Old Rocket',
  ansprechpartner: 'Herr Beispiel',
  email: 'kontakt@oldrocket.de',
  quelle: 'formular',
  beschreibung: 'Website Relaunch für 4.900 €'
};

const extracted = {
  leistung: 'Website Relaunch',
  preis: 4900,
  zahlungsmodell: '50/50',
  lieferzeit: '3 Wochen',
  zusammenfassung: 'Relaunch der Firmenwebsite.',
  methode: 'heuristik'
};

test('Angebot aus Lead: Nummer, Position, Textbausteine', () => {
  const now = new Date('2026-06-10T10:00:00Z');
  const offer = createOfferFromLead(lead, extracted, [], undefined, now);
  assert.equal(offer.nummer, 'AN-2026-0001');
  assert.equal(offer.status, 'entwurf');
  assert.equal(offer.positionen.length, 1);
  assert.equal(offer.positionen[0].einzelpreis, 4900);
  assert.match(offer.texte.zahlungsbedingungen, /50 % Anzahlung/);
  assert.match(offer.texte.lieferzeit, /3 Wochen/);
  assert.match(offer.texte.intro, /Herr Beispiel/);
});

test('Angebotsnummern zählen pro Jahr hoch', () => {
  const now = new Date('2026-06-10T10:00:00Z');
  const offers = [{ nummer: 'AN-2026-0007' }, { nummer: 'AN-2025-0099' }];
  assert.equal(nextOfferNumber(offers, now), 'AN-2026-0008');
});

test('Statusfluss: entwurf → geprueft → versendet → gewonnen mit Zeitstempeln', () => {
  const offer = createOfferFromLead(lead, extracted, []);
  setStatus(offer, 'geprueft');
  setStatus(offer, 'versendet');
  assert.ok(offer.versendetAm);
  setStatus(offer, 'gewonnen');
  assert.ok(offer.entschiedenAm);
  assert.equal(offer.status, 'gewonnen');
});

test('Ungültige Statuswechsel werden abgelehnt', () => {
  const offer = createOfferFromLead(lead, extracted, []);
  assert.throws(() => setStatus(offer, 'gewonnen'), /nicht erlaubt/);
  assert.throws(() => setStatus(offer, 'versendet'), /nicht erlaubt/);
});

test('Dashboard-Statistik inkl. Abschlussquote', () => {
  const mk = (status, preis = 1000) => {
    const o = createOfferFromLead(lead, { ...extracted, preis }, []);
    o.status = status;
    return o;
  };
  const offers = [mk('entwurf'), mk('versendet', 2000), mk('gewonnen', 5000), mk('gewonnen', 3000), mk('verloren')];
  const s = dashboardStats(offers);
  assert.equal(s.offen, 2);
  assert.equal(s.gewonnen, 2);
  assert.equal(s.verloren, 1);
  assert.equal(s.abschlussquote, 67);
  assert.equal(s.offenesVolumen, 3000);
  assert.equal(s.gewonnenesVolumen, 8000);
});

test('Summenberechnung über Positionen', () => {
  assert.equal(calcSumme([{ menge: 2, einzelpreis: 100 }, { menge: 1, einzelpreis: 50.5 }]), 250.5);
});
