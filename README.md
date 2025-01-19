# Story Reader

This project is a web-based application that allows users to create, read, edit, and listen to stories. The text-to-speech functionality reads the stories aloud, and users can control playback with options to play, pause, and stop.

## Features

- **User Authentication**: Users can sign in and manage their stories securely using Supabase.
- **Story Management**: Users can create, edit, and delete stories.
- **Text-to-Speech**: The app reads stories aloud, with controls for play, pause, and stop.
- **Playback State**: The app saves and resumes the playback state, so users can continue listening where they left off.

## Setup

### Prerequisites

- Node.js
- A Supabase account for authentication and data storage.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Oluwaseg/story-reader.git
   cd story-reader
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your Supabase project and configure the environment variables in `.env`:

   ```bash
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

## Known Issues

- **Playback Bug**: The current text-to-speech playback is buggy. To start playback, you need to pause and then play again. Additionally, the pause functionality is not working correctly at the moment.
- **Text-to-Speech API**: The app currently uses browser-based speech synthesis, but there are plans to switch to Google Cloud or another API in the future to improve the reliability and quality of the text-to-speech functionality.

## Future Plans

- Integrate Google Cloud or another third-party API for text-to-speech to enhance playback quality and reliability.
- Improve the playback controls, including better pause and resume functionality.
