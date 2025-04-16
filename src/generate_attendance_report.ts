import * as fs from 'fs'; 
import * as path from 'path'; 
import csvParser from 'csv-parser'; 

// Interfaces
interface Player {
    player_id: string;
    player_name: string;
    player_email: string;
    gender: string;
    age: string;
}

interface Event {
    event_id: string;
    event_name: string;
    event_location: string;
    event_date: string;
}

interface Rsvp {
    rsvp_id: string;
    event_id: string;
    player_id: string;
    status: 'Yes' | 'No' | 'Maybe' | string;
}


interface EventAttendance {
    event_id: string;
    event_name: string;
    attendee_names: string[]; 
}

// Helper function to read CSV
function readCsvFile<T>(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        if (!fs.existsSync(filePath)) {
            return reject(new Error(`Input file not found: ${filePath}`));
        }
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Helper function to escape basic HTML characters
function escapeHtml(unsafe: string): string {
    if (!unsafe) return ''; // Handling null/undefined input
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

// --- Main Report Generation Logic ---
async function generateHtmlReport() { 
    try {
        
        const playersFilePath = path.join(__dirname, '../players.csv'); 
        const eventsFilePath = path.join(__dirname, '../events.csv');
        const rsvpFilePath = path.join(__dirname, '../rsvp.csv');
        const outputFilePath = path.join(__dirname, '../attendance_report.html');

        console.log('Reading CSV files...');
        // Reading all necessary files concurrently
        const [playersData, eventsData, rsvpData] = await Promise.all([
            readCsvFile<Player>(playersFilePath), 
            readCsvFile<Event>(eventsFilePath),
            readCsvFile<Rsvp>(rsvpFilePath)
        ]);
        console.log(`Read ${playersData.length} players, ${eventsData.length} events, and ${rsvpData.length} RSVPs.`);

        // 1. Creating a quick lookup map for player names
        const playerMap = new Map<string, string>(); // Map player_id -> player_name
        for (const player of playersData) {
            if (player && player.player_id) {
                playerMap.set(player.player_id, player.player_name || 'Unknown Player');
            }
        }

        // 2. Initializing event attendance map
        const eventAttendanceMap = new Map<string, EventAttendance>();
        for (const event of eventsData) {
             if (!event || typeof event.event_id === 'undefined') {
                console.warn('Warning: Skipping event with missing or invalid event_id:', event);
                continue;
            }
            eventAttendanceMap.set(event.event_id, {
                event_id: event.event_id,
                event_name: event.event_name || 'Unnamed Event',
                attendee_names: [] // Initializing with empty array for names
            });
        }

        // 3. Populating attendee names from RSVPs
        for (const rsvp of rsvpData) {
             if (!rsvp || typeof rsvp.event_id === 'undefined' || typeof rsvp.player_id === 'undefined') {
                 console.warn('Warning: Skipping RSVP entry with missing IDs:', rsvp);
                continue;
            }

            if (rsvp.status === 'Yes') {
                const eventAttendance = eventAttendanceMap.get(rsvp.event_id);
                if (eventAttendance) {
                    const playerName = playerMap.get(rsvp.player_id);
                    if (playerName) {
                        eventAttendance.attendee_names.push(playerName); 
                    } else {
                        console.warn(`Warning: Found RSVP 'Yes' for unknown player_id: ${rsvp.player_id} at event ${rsvp.event_id}`);
                        eventAttendance.attendee_names.push(`Unknown Player (ID: ${rsvp.player_id})`); 
                    }
                } else {
                    console.warn(`Warning: Found RSVP for event_id not present in events file: ${rsvp.event_id}`);
                }
            }
        }

        
        const reportData = Array.from(eventAttendanceMap.values())
            .filter(event => !isNaN(parseInt(event.event_id)))
            .sort((a, b) => parseInt(a.event_id) - parseInt(b.event_id));

       
        console.log('Generating HTML report content...');
        let htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Attendance Report</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        td ul { margin: 0; padding-left: 20px; } /* Style for unordered list if used */
    </style>
</head>
<body>
    <h1>Event Attendance Report</h1>
    <table>
        <thead>
            <tr style = "text-align:center">
                <th style = "text-align:center" >Serial Number</th>
                <th style = "text-align:center" >Event Name</th>
                <th style = "text-align:center" >Confirmed Attendees</th>
                <th style = "text-align:center" >Number of Attendees <br>(${reportData.reduce((sum, event) => sum + event.attendee_names.length, 0)} Total)</th>
            </tr>
        </thead>
        <tbody>`; 

        reportData.forEach((event, index) => {
            const attendeeListHtml = event.attendee_names.length > 0
                ? event.attendee_names.map(name => escapeHtml(name)).join(', ')
                : '<em>None</em>';

            htmlString += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(event.event_name)}</td>
                <td>${attendeeListHtml}</td>
                <td>${event.attendee_names.length}</td>
            </tr>`; 
        });

        
        htmlString += `
        </tbody>
    </table>
</body>
</html>`;


        // --- Writing HTML to File ---
        console.log(`Writing HTML report to ${outputFilePath}...`);
        fs.writeFileSync(outputFilePath, htmlString, 'utf8'); // Writing the string to file

        console.log('HTML Attendance report with names generated successfully!');

    } catch (error) {
        console.error('Error generating HTML report with names:', error);
    }
}

// Report generation function
generateHtmlReport();