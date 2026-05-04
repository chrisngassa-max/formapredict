type InternalNoteProps = {
  note: string;
};

export function InternalNote({ note }: InternalNoteProps) {
  return (
    <div className="internal-note">
      {note.split("\n").map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
