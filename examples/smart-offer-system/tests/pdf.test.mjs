import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOfferPdf, formatEUR, PdfBuilder } from '../src/pdf.mjs';
import { createOfferFromLead } from '../src/offer.mjs';
import { DEFAULT_SETTINGS } from '../src/templates.mjs';

test('formatEUR formatiert deutsch', () => {
  assert.equal(formatEUR(4900), '4.900,00 €');
  assert.equal(formatEUR(1234567.89), '1.234.567,89 €');
  assert.equal(formatEUR(0), '0,00 €');
});

test('PDF hat gültigen Header, EOF und xref', () => {
  const pdf = new PdfBuilder();
  pdf.text(50, 800, 'Hallo Welt — Umlaute äöüß und € Zeichen');
  const buf = pdf.build();
  const s = buf.toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4'));
  assert.ok(s.includes('xref'));
  assert.ok(s.trimEnd().endsWith('%%EOF'));
  // Euro-Zeichen muss als WinAnsi 0x80 kodiert sein
  assert.ok(buf.includes(0x80));
});

test('Angebots-PDF enthält Nummer, Kunde und Summe', () => {
  const offer = createOfferFromLead(
    { firma: 'Old Rocket', ansprechpartner: 'Herr Beispiel', email: 'kontakt@oldrocket.de', beschreibung: 'x' },
    { leistung: 'Website Relaunch', preis: 4900, zahlungsmodell: '50/50', lieferzeit: '3 Wochen', zusammenfassung: 'Relaunch der Website.' },
    []
  );
  const buf = renderOfferPdf(offer, DEFAULT_SETTINGS);
  const s = buf.toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4'));
  assert.ok(s.includes(offer.nummer));
  assert.ok(s.includes('Old Rocket'));
  assert.ok(s.includes('4.900,00'));
  assert.ok(s.includes('Website Relaunch'));
});

test('Lange Angebote erzeugen mehrere Seiten', () => {
  const offer = createOfferFromLead(
    { firma: 'Test GmbH', beschreibung: 'x' },
    { leistung: 'Großprojekt', preis: 100, zusammenfassung: 'Viele Positionen.' },
    []
  );
  offer.positionen = Array.from({ length: 80 }, (_, i) => ({
    beschreibung: `Position ${i + 1} mit etwas längerem Beschreibungstext`,
    menge: 1,
    einzelpreis: 100
  }));
  const s = renderOfferPdf(offer, DEFAULT_SETTINGS).toString('latin1');
  const seiten = (s.match(/\/Type \/Page\b/g) || []).length;
  assert.ok(seiten >= 2, `erwartet >= 2 Seiten, bekommen: ${seiten}`);
});
