import { getNotes } from "@/lib/actions";
import { NotesClient } from "./NotesClient";

export const revalidate = 0; // Fresh dynamic notes on every request

export default async function NotesPage() {
  const notes = await getNotes();

  return <NotesClient initialNotes={notes} />;
}
