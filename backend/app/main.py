import random
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cereri de oriunde în dezvoltare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = {
    "Manele" : "songs.json",
    "Bad Bunny" : "songs_bad_bunny.json",
    "Dua Lipa" : "songs_dualipa.json",
    "Ed Sheeran" : "songs_edsheeran.json",
    "Ariana Grande" : "songs_arianagrande.json",
    "Taylor Swift" : "songs_taylorswift.json"
}
LOADED_CATEGORIES = {
}
for category, file_name in CATEGORIES.items():
    songs_path = Path(__file__).parent.parent / f"songs/{file_name}"
    with open(songs_path, encoding="utf-8") as f:
        LOADED_CATEGORIES[category] = json.load(f)



# <-- 2. Definim calea și expunem folderul audio către frontend
audio_path = Path(__file__).parent.parent / "audio"
app.mount("/audio", StaticFiles(directory=audio_path), name="audio")


class GuessRequest(BaseModel):
    current_song_id: str
    guessed_song_id: str

@app.get("/")
def home():
    return {"mesaj" : "Serverul Functioneaza"}

@app.get("/random-song")
def random_song(category: str):
    song = random.choice(LOADED_CATEGORIES[category])
    return {
        "id" : song["song_id"],
        "preview": song["audio_url"],
    }

@app.get("/songs-choices")
def list_songs(category: str):
    songs_dict = []
    for song in LOADED_CATEGORIES[category]:
        songs_dict.append({
            'id': song["song_id"],
            'label': f"{song['artist_name']} - {song['song_name']}"
        }
        )
    return songs_dict

@app.post("/check-guess")
def check_guess(data: GuessRequest):
    if data.guessed_song_id != data.current_song_id:
        return {
            "correct" : False,
            "message" : "Maiiiii! Esti praaaaf!!!"
        }
    else:
        return {
            "correct" : True,
            "message" : "Bravo, viata mea! Esti top!!!!!"
        }
