import { ConsoleLogger, ILogger } from './utils';
import { RsvpService } from './services';
import { RsvpEntry, Player } from './interfaces'; // Player is not used here but good to import if needed

// --- Setup ---

// 1. Creating logger instance (Dependency)
const logger: ILogger = new ConsoleLogger();
logger.log('Application starting...');

// 2. Defining some initial data (optional)
const initialRsvps: RsvpEntry[] = [
  { playerId: 'player1', status: 'Maybe' },
  { playerId: 'player2', status: 'No' },
  { playerId: 'player3', status: 'Maybe' },
  { playerId: 'player4', status: 'Yes' },
];

// 3. Instantiating the service, injecting the logger and initial data
const rsvpService = new RsvpService(logger, initialRsvps);

// --- Usage ---

logger.log('\n--- Using the RSVP Service ---');

// Adding a new player
rsvpService.addOrUpdateRsvp('player5', 'Yes');

// Updating an existing player
rsvpService.addOrUpdateRsvp('player2', 'No');

// Trying to add an invalid status (should log an error)
try {
  rsvpService.addOrUpdateRsvp('player6', 'Invalid' as any); // using 'as any', helps to bypass TS check for demo
} catch (e) {
  logger.error(
    'Caught error trying to add invalid status (though service handles internally):',
    e
  );
}

// Getting confirmed attendees
const confirmed = rsvpService.getConfirmedAttendees();
logger.log('\nConfirmed Attendees:', confirmed); 

// Getting counts
const counts = rsvpService.getCounts();
logger.log('\nRSVP Counts:', counts);

// Getting status for a specific player
const player3Status = rsvpService.getPlayerStatus('player3');
logger.log(`\nStatus for player3: ${player3Status}`); 

const playerUnknownStatus = rsvpService.getPlayerStatus('player_unknown');
logger.log(`\nStatus for player_unknown: ${playerUnknownStatus}`); 

logger.log('\n--- Application Finished ---');
