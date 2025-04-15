/**
 * Defines the possible RSVP statuses.
 */
export type RsvpStatus = 'Yes' | 'No' | 'Maybe';

/**
 * Represents the structure for returning RSVP counts.
 */
export interface RsvpCounts {
  total: number;
  confirmed: number; // Status "Yes"
  declined: number; // Status "No"
  maybe: number; // Status "Maybe"
}

/**
 * Represents the input structure for initial RSVP data
 * or potentially for update operations if Player object is preferred.
 */
export interface RsvpEntry {
  playerId: string; // Using string ID for flexibility
  status: RsvpStatus;
}
