import { LegalLayout } from '@/components/LegalLayout';

export const metadata = { title: 'AGB' };

export default function AgbPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen">
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese AGB gelten für die Nutzung des digitalen Prüfungscoachs (nachfolgend „Dienst"), angeboten von
        [DEIN NAME / FIRMENNAME] (nachfolgend „Anbieter").
      </p>

      <h2>2. Leistung</h2>
      <p>
        Der Dienst stellt eine adaptive Lern- und Prüfungsvorbereitungssoftware bereit. Die kostenlose Version
        umfasst Registrierung, Onboarding und die Eingangsdiagnose. Der kostenpflichtige Vollzugang umfasst die
        adaptiven Lerneinheiten, Wiederholungen und Prüfungssimulationen für die Dauer gemäß Ziffer 4.
      </p>
      <p>
        Der Anbieter übernimmt <strong>keine Garantie für das Bestehen einer Prüfung</strong>. Die Inhalte
        dienen der Vorbereitung; die tatsächliche Prüfungsleistung hängt von vielen Faktoren ab.
      </p>

      <h2>3. Vertragsschluss &amp; Preise</h2>
      <p>
        Mit Abschluss des Kaufvorgangs kommt ein Vertrag über den Vollzugang zustande. Es gilt der zum
        Kaufzeitpunkt angezeigte Preis inkl. gesetzlicher Umsatzsteuer. Die Zahlung wird über den
        Zahlungsdienstleister [Stripe] abgewickelt.
      </p>

      <h2>4. Laufzeit des Vollzugangs</h2>
      <p>
        Der Vollzugang gilt als Einmalkauf bis zum angegebenen Prüfungstermin des Nutzers (zzgl. Pufferzeit),
        mindestens jedoch 30 Tage ab Kauf. [Bei einem Abo-Modell diesen Abschnitt entsprechend ersetzen.]
      </p>

      <h2>5. Widerrufsrecht für Verbraucher</h2>
      <p>
        Als Verbraucher hast du ein 14-tägiges Widerrufsrecht. Bei digitalen Inhalten erlischt das
        Widerrufsrecht, wenn du ausdrücklich zugestimmt hast, dass mit der Ausführung vor Ablauf der
        Widerrufsfrist begonnen wird, und du deine Kenntnis vom Erlöschen bestätigt hast. [Vollständige
        Widerrufsbelehrung inkl. Muster-Widerrufsformular hier ergänzen.]
      </p>

      <h2>6. Pflichten des Nutzers</h2>
      <p>
        Zugangsdaten sind geheim zu halten. Der Zugang ist personengebunden und nicht übertragbar. Inhalte
        dürfen nicht vervielfältigt, weitergegeben oder öffentlich zugänglich gemacht werden.
      </p>

      <h2>7. Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben,
        Körper und Gesundheit. Im Übrigen ist die Haftung auf vertragstypische, vorhersehbare Schäden begrenzt.
      </p>

      <h2>8. Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen unwirksam sein, bleibt
        der übrige Vertrag wirksam.
      </p>

      <p className="text-xs text-ink-500">Stand: [DATUM]. Vorlage — vor dem Verkauf rechtlich prüfen lassen.</p>
    </LegalLayout>
  );
}
