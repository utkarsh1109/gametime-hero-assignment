# Gametime Hero Coding Challenge: RSVP Service Module

This project implements a simple, in-memory RSVP management service using TypeScript as part of the Gametime Hero coding challenge submission.

## Project Goal

To create a focused TypeScript module (`RsvpService`) capable of managing player RSVPs ("Yes", "No", "Maybe"), retrieving confirmed attendees, and providing counts of responses, adhering to modern development best practices like Dependency Injection, Single Responsibility Principle, and clear type definitions.

## Prerequisites

Before running this project locally, ensure you have the following installed:

* **Node.js:** (e.g., v18 or later recommended) - Includes npm. Download from [nodejs.org](https://nodejs.org/)
* **Git:** For cloning the repository (if applicable) and version control. Download from [git-scm.com](https://git-scm.com/)

*(Note: TypeScript and other project dependencies will be installed locally via npm).*

## Setup & Installation

1.  **Clone Repository (Optional - if viewing on GitHub):**
    ```bash
    git clone [https://github.com/utkarsh1109/gametime-hero-assignment.git](https://github.com/utkarsh1109/gametime-hero-assignment.git)
    ```
2.  **Navigate to Project Directory:**
    ```bash
    cd rsvp-challenge
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *(This installs all necessary packages listed in `package.json`, including TypeScript, ts-node, Jest, Prettier etc.)*

## Running the Example Usage

An example script `src/main.ts` demonstrates basic usage of the `RsvpService`. To run it:

```bash
npx ts-node src/main.ts
```

*(Alternatively, if you added a "start" script to `package.json`: `npm start`)*

## Running Unit Tests

Unit tests have been written using Jest to verify the functionality and edge cases of the `RsvpService`. To run the tests:

```bash
npm test
```

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting.

* To check formatting: `npx prettier --check .`
* To apply formatting: `npx prettier --write .`

## Design Choices & Implementation Details

* **In-Memory Storage:** Utilized a TypeScript `Map` (`playerId` -> `RsvpStatus`) for storing RSVP data to fulfill the challenge requirements for a focused module without external dependencies. This provides efficient O(1) average time complexity for primary operations.
* **TypeScript:** Employed TypeScript for static typing, interfaces (`ILogger`, `RsvpCounts`), and type aliases (`RsvpStatus`) to improve code reliability, maintainability, and developer experience. Strict compiler options are enabled in `tsconfig.json`.
* **Dependency Injection (DI):** Injected an `ILogger` dependency into the `RsvpService` constructor, allowing different logging implementations and enhancing testability. A simple `ConsoleLogger` is provided.
* **Single Responsibility Principle (SRP):** Methods within `RsvpService` are focused on specific tasks (e.g., `addOrUpdateRsvp`, `getCounts`, `getConfirmedAttendees`). The `ConsoleLogger` solely handles logging.
* **Testing:** Implemented unit tests using Jest, covering various scenarios, edge cases, and validation logic. Dependency mocking (`ILogger`) was used to isolate the service during tests and verify interactions.

## Assumptions Made

* Player IDs are unique strings. Empty strings are considered invalid.
* The service operates entirely in memory; state is not persisted and will be lost when the application stops.
* The primary focus was on the backend service logic as per the challenge description.

## Potential Future Improvements (Beyond Challenge Scope)

* Integration with a persistent data store (e.g., PostgreSQL, MongoDB) for storing players, events, and RSVPs.
* Addition of an `Event` concept to associate RSVPs with specific events.
* More comprehensive error handling and validation suitable for a production environment.
* Exposing the service via a REST or GraphQL API.

```
---

**How to Add the README to GitHub:**

1.  **Save** the `README.md` file in the root of your `rsvp-challenge` folder.
2.  Open your terminal in the `rsvp-challenge` folder.
3.  **Check Status:** See the new file:
    ```bash
    git status
    ```
    *(Should show `README.md` as untracked or modified)*
4.  **Stage the file:**
    ```bash
    git add README.md
    ```
5.  **Commit the file:**
    ```bash
    git commit -m "Add project README file"
    ```
6.  **Push the commit:**
    ```bash
    git push
    ```

