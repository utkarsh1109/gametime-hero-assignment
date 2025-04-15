/**
 * Represents a player.
 * While the service might only strictly need the ID internally,
 * defining a full Player interface is good practice for scalability.
 */
export interface Player {
  id: string;
  name: string; // Optional but often useful context
}
