export default function transformNoteAccessFromGraph({
  note,
  sharedSecret,
}) {
  return {
    ...note,
    sharedSecret,
    noteHash: note.id,
  };
}
