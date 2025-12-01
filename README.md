# Quillt

Quillt is a lightweight social-coordination app that helps friends easily share upcoming travel plans and automatically discover when they overlap in the same city.

## Features

- **Social Feed:** See where your friends are traveling next.
- **Overlap Detection:** The "Delight Moment" — automatically highlights when you and a friend will be in the same city at the same time.
- **Smart Descriptions:** Uses Google Gemini to generate fun, "vibe-based" descriptions for your trips.
- **My Plans:** A dedicated dashboard for your itinerary and discovered overlaps.
- **Simple Login:** Uses a "Nickname + PIN" system for low-friction beta testing.

## 🐳 Deployment Guide (VS Code + Docker)

This guide assumes you have **Docker Desktop** installed and running on your machine.

### 1. Prerequisites
1.  **Install Docker:** Download Docker Desktop from [docker.com](https://www.docker.com/).
2.  **Install VS Code Extension:** Search for "Docker" in VS Code Extensions (by Microsoft) and install it.
3.  **Get an API Key:** You need a Gemini API Key. Create a file named `.env` in the root folder and add:
    ```
    API_KEY=your_actual_gemini_api_key_here
    ```
4.  **Configure Firebase:** Open `src/firebase.ts` and paste your Firebase project configuration object.

### 2. Build the Docker Image
Open the VS Code Terminal (`Ctrl + ` `) and run:

```bash
docker build -t quillt-app .
```
*This command reads the `Dockerfile`, installs dependencies, builds the React app, and packages it into an Nginx server image named `quillt-app`.*

### 3. Run the Container
Once the build finishes, run this command to start the app:

```bash
docker run -d -p 8080:80 quillt-app
```
*   `-d`: Runs in detached mode (background).
*   `-p 8080:80`: Maps port 8080 on your laptop to port 80 inside the container.

### 4. Access the App
Open your browser and go to:
**http://localhost:8080**

### Troubleshooting
- **Firebase Error:** If the app loads but you can't log in, ensure you updated `src/firebase.ts` with your real config and rebuilt the image (`docker build...`).
- **API Key:** If AI features fail, ensure your `.env` file exists and contains `API_KEY=...` before building.

## ☁️ Deployment to the Cloud (Optional)
Since you have a Dockerfile, you can deploy this easily to services that support containers:
- **Render / Railway / Fly.io:** Connect your GitHub repo, and they will automatically detect the Dockerfile and build it.
- **Google Cloud Run:** `gcloud run deploy --source .`