import { ConsoleLogger, ILogger } from './utils';
import { RsvpService } from './services';
import { RsvpEntry, Player } from './interfaces'; // Player is not used here but good to import if needed

// --- Setup ---

// 1. Create logger instance (Dependency)
const logger: ILogger = new ConsoleLogger();
logger.log('Application starting...');

// 2. Define some initial data (optional)
const initialRsvps: RsvpEntry[] = [
  { playerId: 'player1', status: 'Maybe' },
  { playerId: 'player2', status: 'No' },
  { playerId: 'player3', status: 'Maybe' },
  { playerId: 'player4', status: 'Yes' },
];

// 3. Instantiate the service, injecting the logger and initial data
const rsvpService = new RsvpService(logger, initialRsvps);

// --- Usage ---

logger.log('\n--- Using the RSVP Service ---');

// Add a new player
rsvpService.addOrUpdateRsvp('player5', 'Yes');

// Update an existing player
rsvpService.addOrUpdateRsvp('player2', 'No');

// Try adding an invalid status (should log an error)
// Note: TypeScript might catch this if 'Invalid' is not assignable to RsvpStatus
try {
  rsvpService.addOrUpdateRsvp('player6', 'Invalid' as any); // Use 'as any' to bypass TS check for demo
} catch (e) {
  logger.error(
    'Caught error trying to add invalid status (though service handles internally):',
    e
  );
}

// Get confirmed attendees
const confirmed = rsvpService.getConfirmedAttendees();
logger.log('\nConfirmed Attendees:', confirmed); // Expected: ['player1', 'player4', 'player5']

// Get counts
const counts = rsvpService.getCounts();
logger.log('\nRSVP Counts:', counts);
// Expected: { total: 5, confirmed: 3, declined: 0, maybe: 2 }

// Get status for a specific player
const player3Status = rsvpService.getPlayerStatus('player3');
logger.log(`\nStatus for player3: ${player3Status}`); // Expected: Maybe

const playerUnknownStatus = rsvpService.getPlayerStatus('player_unknown');
logger.log(`\nStatus for player_unknown: ${playerUnknownStatus}`); // Expected: undefined

logger.log('\n--- Application Finished ---');
