export function Settings() {
  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <p className="eyebrow">Paramètres métier</p>
          <h2>Règles indicatives Phase 1</h2>
          <p>Lecture seule pour le MVP. Ces valeurs seront paramétrables en Phase 2.</p>
        </div>
      </header>
      <section className="panel">
        <dl className="breakdown">
          <div>
            <dt>Forfait CPF indicatif</dt>
            <dd>150 €</dd>
          </div>
          <div>
            <dt>Plafond RS indicatif</dt>
            <dd>1 500 €</dd>
          </div>
          <div>
            <dt>Seuil prioritaire</dt>
            <dd>Score ≥ 70 et complétude ≥ 80 %</dd>
          </div>
          <div>
            <dt>Mode stockage</dt>
            <dd>localStorage navigateur</dd>
          </div>
        </dl>
      </section>
      <p className="legal-note">
        Cette projection est indicative et ne constitue pas une décision officielle de financement. Les aides proposées doivent être vérifiées auprès des organismes concernés.
      </p>
    </div>
  );
}
