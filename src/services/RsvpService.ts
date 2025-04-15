import { RsvpStatus, RsvpCounts, RsvpEntry } from '../interfaces';
import { ILogger } from '../utils';

/**
 * Manages RSVP responses for players.
 * Follows SRP: Its single responsibility is managing RSVP state.
 */
export class RsvpService {
  // Use a Map for efficient O(1) average time complexity for add/update/get by player ID.
  // Stores Player ID -> RSVP Status.
  private rsvps: Map<string, RsvpStatus>;
  private readonly logger: ILogger; // Dependency Injection

  /**
   * Creates an instance of RsvpService.
   * @param logger - An implementation of ILogger for logging.
   * @param initialEntries - Optional array of initial RSVP entries to populate the service.
   */
  constructor(logger: ILogger, initialEntries: RsvpEntry[] = []) {
    // Dependency Injection: Store the provided logger instance.
    this.logger = logger;
    this.rsvps = new Map<string, RsvpStatus>();

    // Populate initial state if provided
    if (initialEntries && initialEntries.length > 0) {
      this.logger.log(
        `Initializing RsvpService with ${initialEntries.length} entries.`
      );
      initialEntries.forEach((entry) => {
        // Basic validation example (could be more robust)
        if (!entry.playerId || !entry.status) {
          this.logger.warn('Skipping invalid initial entry:', entry);
          return; // Early return for this invalid entry
        }
        // Directly use the addOrUpdate method to leverage its logic/logging
        this.addOrUpdateRsvp(entry.playerId, entry.status, true); // Pass flag to reduce noise during init
      });
    } else {
      this.logger.log('Initializing RsvpService with empty state.');
    }
  }

  /**
   * Adds or updates the RSVP status for a given player ID.
   * This method is focused and adheres to SRP.
   * @param playerId - The unique identifier for the player.
   * @param status - The player's RSVP status ("Yes", "No", or "Maybe").
   * @param isInitialization - Internal flag to reduce logging noise during constructor population.
   */
  addOrUpdateRsvp(
    playerId: string,
    status: RsvpStatus,
    isInitialization: boolean = false
  ): void {
    // Input validation (using TypeScript types helps, but runtime check is safer)
    if (!playerId) {
      this.logger.error('addOrUpdateRsvp called with invalid playerId.');
      return; // Early return
    }
    const validStatuses: RsvpStatus[] = ['Yes', 'No', 'Maybe'];
    if (!validStatuses.includes(status)) {
      this.logger.error(
        `addOrUpdateRsvp called with invalid status "${status}" for player ${playerId}.`
      );
      return; // Early return
    }

    const previousStatus = this.rsvps.get(playerId);
    this.rsvps.set(playerId, status);

    if (!isInitialization) {
      if (previousStatus) {
        this.logger.log(
          `Updated RSVP for player ${playerId} from ${previousStatus} to ${status}.`
        );
      } else {
        this.logger.log(`Added new RSVP for player ${playerId}: ${status}.`);
      }
    }
  }

  /**
   * Gets a list of player IDs who have confirmed ("Yes").
   * This method derives state from the internal `rsvps` map.
   * @returns An array of player IDs (strings).
   */
  getConfirmedAttendees(): string[] {
    const confirmedIds: string[] = [];
    // Iterate over the map entries. Using `for...of` is clear.
    for (const [playerId, status] of this.rsvps.entries()) {
      if (status === 'Yes') {
        confirmedIds.push(playerId);
      }
    }
    this.logger.log(`Retrieved ${confirmedIds.length} confirmed attendees.`);
    return confirmedIds;
    // Alternative functional approach (slightly less explicit iteration):
    // return Array.from(this.rsvps.entries())
    //   .filter(([_, status]) => status === 'Yes')
    //   .map(([playerId, _]) => playerId);
  }

  /**
   * Calculates and returns the counts of different RSVP statuses.
   * This method derives state and adheres to SRP (counting is its job).
   * @returns An RsvpCounts object.
   */
  getCounts(): RsvpCounts {
    // Initialize counts - ensures all keys exist in the result object.
    const counts: RsvpCounts = {
      total: 0,
      confirmed: 0,
      declined: 0,
      maybe: 0,
    };

    // Iterate through the statuses stored in the map's values.
    for (const status of this.rsvps.values()) {
      counts.total++; // Increment total for every entry
      switch (status) {
        case 'Yes':
          counts.confirmed++;
          break;
        case 'No':
          counts.declined++;
          break;
        case 'Maybe':
          counts.maybe++;
          break;
        // No default needed as RsvpStatus type covers all valid cases
      }
    }

    this.logger.log('Calculated RSVP counts:', counts);
    return counts;
  }

  /**
   * Retrieves the RSVP status for a specific player.
   * Useful helper method, might not be strictly required by the prompt but good practice.
   * @param playerId - The ID of the player to look up.
   * @returns The RsvpStatus or undefined if the player hasn't RSVP'd.
   */
  getPlayerStatus(playerId: string): RsvpStatus | undefined {
    return this.rsvps.get(playerId);
  }
}
