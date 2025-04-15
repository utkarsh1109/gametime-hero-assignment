// src/services/RsvpService.spec.ts

import { RsvpService } from './RsvpService';
import { ILogger } from '../utils/logger.interface'; // Adjust path if needed
import { RsvpStatus, RsvpCounts, RsvpEntry } from '../interfaces'; // Adjust path if needed

// Helper function to create a fresh mock logger for each test run
// Using jest.Mocked provides better type safety for mock functions
const createMockLogger = (): jest.Mocked<ILogger> => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(), // Include even if optional, mocking is easy
});

// Main test suite for the RsvpService
describe('RsvpService', () => {
  // Declare variables scoped to the describe block
  let rsvpService: RsvpService;
  let mockLogger: jest.Mocked<ILogger>;

  // This function runs before each individual 'it' test block
  beforeEach(() => {
    // Create new mocks and a new service instance for each test
    // This ensures tests are isolated and don't interfere with each other
    mockLogger = createMockLogger();
    rsvpService = new RsvpService(mockLogger); // Initialize without initial data by default
  });

  // --- Test Constructor and Initial State ---
  describe('Initialization', () => {
    it('should start with zero counts and log initialization message', () => {
      // Service is already created in beforeEach
      const counts = rsvpService.getCounts();
      expect(counts).toEqual({ total: 0, confirmed: 0, declined: 0, maybe: 0 });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing RsvpService with empty state.'
      );
      // Ensure no other logs occurred unexpectedly
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should initialize correctly when provided with initial RSVP entries', () => {
      const initialEntries: RsvpEntry[] = [
        { playerId: 'p10', status: 'Yes' },
        { playerId: 'p20', status: 'No' },
        { playerId: 'p30', status: 'Yes' },
      ];
      // Create a specific instance for this test
      const serviceWithData = new RsvpService(mockLogger, initialEntries);

      expect(serviceWithData.getCounts()).toEqual({
        total: 3,
        confirmed: 2,
        declined: 1,
        maybe: 0,
      });
      expect(serviceWithData.getPlayerStatus('p10')).toBe('Yes');
      expect(serviceWithData.getPlayerStatus('p20')).toBe('No');
      expect(serviceWithData.getPlayerStatus('p30')).toBe('Yes');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing RsvpService with 3 entries.'
      );
    });

    it('should skip invalid entries during initialization and log warnings/errors', () => {
      const initialEntries: RsvpEntry[] = [
        { playerId: 'pValid', status: 'Yes' },
        { playerId: '', status: 'Maybe' }, // Invalid player ID
        { playerId: 'pInvalidStatus', status: 'Definitely' as any }, // Invalid status
      ];
      const serviceWithInvalidData = new RsvpService(
        mockLogger,
        initialEntries
      );

      // Only the valid entry should be counted
      expect(serviceWithInvalidData.getCounts()).toEqual({
        total: 1,
        confirmed: 1,
        declined: 0,
        maybe: 0,
      });
      expect(serviceWithInvalidData.getPlayerStatus('pValid')).toBe('Yes');

      // Check that appropriate warnings/errors were logged for the invalid entries
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Skipping invalid initial entry:',
        { playerId: '', status: 'Maybe' }
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'addOrUpdateRsvp called with invalid status "Definitely" for player pInvalidStatus.'
      );
    });
  });

  // --- Test addOrUpdateRsvp ---
  describe('addOrUpdateRsvp', () => {
    it('should add a new "Yes" RSVP and update counts correctly', () => {
      rsvpService.addOrUpdateRsvp('player1', 'Yes');
      expect(rsvpService.getPlayerStatus('player1')).toBe('Yes');
      expect(rsvpService.getCounts()).toEqual({
        total: 1,
        confirmed: 1,
        declined: 0,
        maybe: 0,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Added new RSVP for player player1: Yes.'
      );
    });

    it('should add a new "No" RSVP and update counts correctly', () => {
      rsvpService.addOrUpdateRsvp('player2', 'No');
      expect(rsvpService.getPlayerStatus('player2')).toBe('No');
      expect(rsvpService.getCounts()).toEqual({
        total: 1,
        confirmed: 0,
        declined: 1,
        maybe: 0,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Added new RSVP for player player2: No.'
      );
    });

    it('should add a new "Maybe" RSVP and update counts correctly', () => {
      rsvpService.addOrUpdateRsvp('player3', 'Maybe');
      expect(rsvpService.getPlayerStatus('player3')).toBe('Maybe');
      expect(rsvpService.getCounts()).toEqual({
        total: 1,
        confirmed: 0,
        declined: 0,
        maybe: 1,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Added new RSVP for player player3: Maybe.'
      );
    });

    it('should update an existing RSVP from "Yes" to "No"', () => {
      rsvpService.addOrUpdateRsvp('player1', 'Yes'); // Initial add
      rsvpService.addOrUpdateRsvp('player1', 'No'); // Update
      expect(rsvpService.getPlayerStatus('player1')).toBe('No');
      expect(rsvpService.getCounts()).toEqual({
        total: 1,
        confirmed: 0,
        declined: 1,
        maybe: 0,
      });
      // Check that the update log message was called
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Updated RSVP for player player1 from Yes to No.'
      );
    });

    it('should update an existing RSVP from "Maybe" to "Yes"', () => {
      rsvpService.addOrUpdateRsvp('playerM', 'Maybe'); // Initial add
      rsvpService.addOrUpdateRsvp('playerM', 'Yes'); // Update
      expect(rsvpService.getPlayerStatus('playerM')).toBe('Yes');
      expect(rsvpService.getCounts()).toEqual({
        total: 1,
        confirmed: 1,
        declined: 0,
        maybe: 0,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Updated RSVP for player playerM from Maybe to Yes.'
      );
    });

    it('should handle multiple additions and updates correctly', () => {
      rsvpService.addOrUpdateRsvp('pA', 'Yes');
      rsvpService.addOrUpdateRsvp('pB', 'No');
      rsvpService.addOrUpdateRsvp('pA', 'Maybe'); // Update pA
      rsvpService.addOrUpdateRsvp('pC', 'Yes');
      expect(rsvpService.getCounts()).toEqual({
        total: 3,
        confirmed: 1,
        declined: 1,
        maybe: 1,
      });
      expect(rsvpService.getPlayerStatus('pA')).toBe('Maybe');
      expect(rsvpService.getPlayerStatus('pB')).toBe('No');
      expect(rsvpService.getPlayerStatus('pC')).toBe('Yes');
    });

    it('should log an error and not add if status is invalid', () => {
      rsvpService.addOrUpdateRsvp('playerInvalid', 'Accepted' as any); // Force invalid status
      expect(rsvpService.getCounts().total).toBe(0); // Should not have been added
      expect(mockLogger.error).toHaveBeenCalledWith(
        'addOrUpdateRsvp called with invalid status "Accepted" for player playerInvalid.'
      );
      expect(mockLogger.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Added new RSVP')
      ); // Ensure add log didn't happen
    });

    // Add more tests if you implement more validation (e.g., for empty player IDs)
  });

  // --- Test getConfirmedAttendees ---
  describe('getConfirmedAttendees', () => {
    it('should return an empty array when the service is empty', () => {
      expect(rsvpService.getConfirmedAttendees()).toEqual([]);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Retrieved 0 confirmed attendees.'
      );
    });

    it('should return an empty array when no players have RSVPd "Yes"', () => {
      rsvpService.addOrUpdateRsvp('p1', 'No');
      rsvpService.addOrUpdateRsvp('p2', 'Maybe');
      expect(rsvpService.getConfirmedAttendees()).toEqual([]);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Retrieved 0 confirmed attendees.'
      );
    });

    it('should return only the player IDs of those who RSVPd "Yes"', () => {
      rsvpService.addOrUpdateRsvp('p1', 'Yes');
      rsvpService.addOrUpdateRsvp('p2', 'No');
      rsvpService.addOrUpdateRsvp('p3', 'Yes');
      rsvpService.addOrUpdateRsvp('p4', 'Maybe');
      rsvpService.addOrUpdateRsvp('p5', 'Yes');

      const attendees = rsvpService.getConfirmedAttendees();
      // Use expect.arrayContaining because the order from a Map isn't guaranteed
      expect(attendees).toHaveLength(3);
      expect(attendees).toEqual(expect.arrayContaining(['p1', 'p3', 'p5']));
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Retrieved 3 confirmed attendees.'
      );
    });
  });

  // --- Test getCounts ---
  describe('getCounts', () => {
    // Initial empty state tested in 'Initialization' suite
    it('should return correct counts after several additions', () => {
      rsvpService.addOrUpdateRsvp('p1', 'Yes');
      rsvpService.addOrUpdateRsvp('p2', 'No');
      rsvpService.addOrUpdateRsvp('p3', 'Maybe');
      rsvpService.addOrUpdateRsvp('p4', 'Yes');
      rsvpService.addOrUpdateRsvp('p5', 'Maybe');
      rsvpService.addOrUpdateRsvp('p6', 'Yes');
      rsvpService.addOrUpdateRsvp('p7', 'No');

      const counts = rsvpService.getCounts();
      expect(counts).toEqual({ total: 7, confirmed: 3, declined: 2, maybe: 2 });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Calculated RSVP counts:',
        counts
      );
    });

    it('should return correct counts after additions and updates', () => {
      rsvpService.addOrUpdateRsvp('p1', 'Yes');
      rsvpService.addOrUpdateRsvp('p2', 'No');
      rsvpService.addOrUpdateRsvp('p1', 'Maybe'); // p1 updated

      const counts = rsvpService.getCounts();
      expect(counts).toEqual({ total: 2, confirmed: 0, declined: 1, maybe: 1 });
    });
  });

  // --- Test getPlayerStatus ---
  describe('getPlayerStatus', () => {
    it('should return the correct status for a player who has RSVPd', () => {
      rsvpService.addOrUpdateRsvp('playerA', 'Maybe');
      rsvpService.addOrUpdateRsvp('playerB', 'Yes');
      expect(rsvpService.getPlayerStatus('playerA')).toBe('Maybe');
      expect(rsvpService.getPlayerStatus('playerB')).toBe('Yes');
    });

    it('should return undefined for a player who has not RSVPd', () => {
      rsvpService.addOrUpdateRsvp('playerA', 'No'); // Add someone else
      expect(rsvpService.getPlayerStatus('nonExistentPlayer')).toBeUndefined();
    });

    it('should return the updated status after a player changes their RSVP', () => {
      rsvpService.addOrUpdateRsvp('playerC', 'No');
      rsvpService.addOrUpdateRsvp('playerC', 'Yes'); // Update
      expect(rsvpService.getPlayerStatus('playerC')).toBe('Yes');
    });
  });
});
