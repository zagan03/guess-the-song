# 🎵 Guess the Song 

An interactive web-based audio preview game where players have to guess the song from a short snippet. Featuring everything from international pop hits to classic manele.

## 🚀 Features
- **Category Selection:** Choose between Manele, Bad Bunny, Dua Lipa, Ed Sheeran, Ariana Grande, and Taylor Swift.
- **Fast Audio Playback:** MP3 previews served directly from local static folders.
- **Answer Validation:** Real-time guess verification system with custom messages.
- **Scalable Database:** Smart scraping system (using the Deezer API) to add new songs without creating duplicates.

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, Uvicorn
- **Frontend:** HTML, CSS, JavaScript (Vanilla / Fetch API)
- **Data Processing:** Custom Python scripts (`requests`, `json`) for downloading songs and populating the JSON files.

## 📦 Installation and Setup

1. **Clone the repository and install the backend dependencies:**
   ```bash
   pip install fastapi uvicorn pydantic requests
   ```

2. **Start the FastAPI server:**
   Ensure you are in the folder containing the backend file (e.g., `main.py` or `app.py`) and run:
   ```bash
   uvicorn main:app --reload
   ```
   *The server will start on `http://127.0.0.1:8000` and automatically expose the `/audio` folder.*

3. **Run all the scripts, starting with `fetch_songs.py`.**

4. **Open the game:**
   Open the `index.html` file in your preferred browser (or use the Live Server extension in VS Code). 

## 🎵 Adding New Songs
The project includes a Python script that uses the Deezer API to expand the song database.

1. Add the IDs of the new albums or playlists to the `PLAYLIST_IDS` list in the script.
2. Run the script. It will automatically download any missing MP3s to the `/audio` folder and append the new songs to the corresponding file (e.g., `songs.json`), avoiding duplicates.
3. Restart the FastAPI server to load the new JSON files into memory.