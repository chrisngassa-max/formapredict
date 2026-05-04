type ScoreGaugeProps = {
  label: string;
  value: number;
  tone?: "green" | "amber" | "red" | "blue";
};

export function ScoreGauge({ label, value, tone = "blue" }: ScoreGaugeProps) {
  return (
    <div className="score-gauge">
      <div className="score-heading">
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <div className="score-track">
        <div className={`score-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
