import { LegalLayout } from '@/components/LegalLayout';

export const metadata = { title: 'Datenschutzerklärung' };

export default function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
        [DEIN NAME / FIRMENNAME], [ANSCHRIFT], [E-MAIL].
      </p>

      <h2>2. Welche Daten wir verarbeiten</h2>
      <p>
        Zur Bereitstellung des Prüfungscoachs verarbeiten wir folgende personenbezogene Daten:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li><strong>Kontodaten:</strong> Name, E-Mail-Adresse, verschlüsseltes Passwort.</li>
        <li><strong>Lernprofil &amp; Lernfortschritt:</strong> Prüfungstermin, Lernzeiten, Selbsteinschätzung,
          Antworten, Punkte, Fehlerursachen und daraus berechnete Lernstände — zur Bereitstellung der
          adaptiven Lernfunktion.</li>
        <li><strong>Zahlungsdaten:</strong> Bei einem Kauf werden Zahlungen über unseren Dienstleister
          [Stripe Payments Europe, Ltd.] abgewickelt. Wir speichern keine Kreditkartendaten, sondern nur den
          Zahlungsstatus und eine Kundenkennung.</li>
        <li><strong>Technische Daten:</strong> Server-Logfiles (IP-Adresse, Zeitpunkt, abgerufene Seite) zur
          Sicherstellung des Betriebs und der Sicherheit.</li>
      </ul>

      <h2>3. Rechtsgrundlagen</h2>
      <p>
        Die Verarbeitung erfolgt zur Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO), zur Wahrung
        berechtigter Interessen am sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO) sowie ggf. auf Grundlage
        deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
      </p>

      <h2>4. Empfänger / Auftragsverarbeiter</h2>
      <p>
        Zur Bereitstellung setzen wir Dienstleister ein, mit denen Auftragsverarbeitungsverträge bestehen,
        u.&nbsp;a.: [Hosting-Anbieter, z.&nbsp;B. Render/Railway], [Zahlungsdienstleister Stripe],
        [E-Mail-Versanddienst, z.&nbsp;B. Resend], [ggf. KI-Dienstleister Anthropic zur Antwortbewertung — es
        werden nur die eingegebenen Antworten, keine Kontodaten übermittelt].
      </p>

      <h2>5. Speicherdauer</h2>
      <p>
        Wir speichern deine Daten, solange dein Konto besteht. Nach Löschung des Kontos werden
        personenbezogene Daten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten (z.&nbsp;B.
        steuerrechtlich für Rechnungen) entgegenstehen.
      </p>

      <h2>6. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) sowie ein Beschwerderecht bei einer
        Aufsichtsbehörde. Wende dich dazu an [E-MAIL].
      </p>

      <h2>7. Cookies</h2>
      <p>
        Wir verwenden ausschließlich technisch notwendige Cookies (Anmelde-Session). Diese sind für den
        Betrieb erforderlich und bedürfen keiner Einwilligung. [Falls du später Analyse-/Marketing-Tools
        einsetzt, ist hier ein Cookie-Banner mit Einwilligung erforderlich.]
      </p>

      <p className="text-xs text-ink-500">Stand: [DATUM]. Diese Erklärung ist eine Vorlage und ersetzt keine Rechtsberatung.</p>
    </LegalLayout>
  );
}
