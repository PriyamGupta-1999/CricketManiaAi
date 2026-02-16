# Super Over Cricket Game

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
