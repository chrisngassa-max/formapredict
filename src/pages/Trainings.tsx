const trainings = [
  ["FLE professionnel", "RS", "Insertion, évolution, communication professionnelle"],
  ["TCF IRN", "Test", "Naturalisation, carte de résident, autorisation de travail"],
  ["TCF TP", "Test", "Mesure générale du niveau de français"],
  ["CLOE FLE", "RS", "Certification transversale en situation professionnelle"],
  ["LILATE", "RS", "Aptitude à travailler en langue étrangère"],
  ["Anglais professionnel", "RS", "Communication métier, tourisme, médical, affaires"],
];

export function Trainings() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalogue MVP</p>
          <h2>Formations suivies</h2>
          <p>Base simple utilisée pour guider la saisie et les projections.</p>
        </div>
      </header>
      <div className="cards-grid">
        {trainings.map(([name, registry, objective]) => (
          <article className="panel" key={name}>
            <p className="eyebrow">{registry}</p>
            <h3>{name}</h3>
            <p>{objective}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
