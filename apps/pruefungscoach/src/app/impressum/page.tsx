import { LegalLayout } from '@/components/LegalLayout';

export const metadata = { title: 'Impressum' };

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <p>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) / § 18 MStV.</p>

      <h2>Diensteanbieter</h2>
      <p>
        [DEIN NAME / FIRMENNAME]<br />
        [STRASSE UND HAUSNUMMER]<br />
        [PLZ ORT]<br />
        [LAND]
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: [TELEFONNUMMER]<br />
        E-Mail: [E-MAIL-ADRESSE]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [UST-IDNR., falls vorhanden — sonst diesen Abschnitt entfernen]
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        [NAME]<br />
        [ANSCHRIFT, falls abweichend]
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen. [Anpassen, falls du teilnimmst.]
      </p>
    </LegalLayout>
  );
}
