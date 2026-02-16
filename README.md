# 🏏 CricketMania AI - Live Commentary Game

**CricketMania AI** is an interactive, single-player cricket web application built with **React** and **Vite**. It features a unique **Live AI Commentary** system powered by **Google Gemini**, delivering dynamic, context-aware match commentary in multiple languages (English, Hindi, Spanish, French) based on real-time game events.

### 🌟 Key Features
- ** AI-Powered Commentary**: Uses `gemini-1.5-flash` to generate exciting, play-by-play commentary.
- **🌍 Multi-Language Support**: Switch instantly between languages for a localized experience.
- **⚡ Super Over Gameplay**: Fast-paced 1-over (or custom) matches with realistic scoring probabilities.
- **🔒 Secure Architecture**: Client-side API key encryption for safe usage.
- **📱 Responsive UI**: "Premium" feel with a mobile-first design, animated scoreboard, and accessibility support.


A simple cricket game with live AI commentary powered by Google Gemini.

## Features
- **Live Commentary**: Get real-time, context-aware commentary from Gemini in multiple languages.
- **Responsive UI**: Play on desktop or mobile.
- **Secure Settings**: Input your own API Key.

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the game in your browser.
## Deployment

### GitHub
The code is pushed to [PriyamGupta-1999/CricketManiaAi](https://github.com/PriyamGupta-1999/CricketManiaAi).

### Google Cloud Platform (GCP)
This project includes a `Dockerfile` and `cloudbuild.yaml` for deployment to Google Cloud Run.

**Prerequisites**:
- Google Cloud Project with Billing enabled.
- `gcloud` CLI installed and authenticated.

**Manual Deployment via Cloud Shell**:
1.  Open [Google Cloud Console](https://console.cloud.google.com/).
2.  Activate Cloud Shell (top right icon).
3.  Clone the repo:
    ```bash
    git clone https://github.com/PriyamGupta-1999/CricketManiaAi.git
    cd CricketManiaAi
    ```
4.  Submit the build:
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```
    *Note: Replace `$PROJECT_ID` in `cloudbuild.yaml` with your actual project ID or let Cloud Build handle it if configured.*

**Alternative (Direct Deploy)**:
```bash
gcloud run deploy cricket-game --source . --region us-central1 --allow-unauthenticated
```
