import requests
import json
from pathlib import Path

PLAYLIST_IDS = [
    "13105243463"
]


def fetch_and_save_playlist():
    tracks = []
    seen_ids = set()

    # creare folder audio/ alaturi de json
    current_dir = Path(__file__).parent.parent
    audio_dir = current_dir / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    for playlist_id in PLAYLIST_IDS:
        api_url = f"https://api.deezer.com/playlist/{playlist_id}"
        response = requests.get(api_url)

        if response.status_code != 200:
            print(f"Eroare la playlist-ul {playlist_id}: {response.status_code}")
            continue

        data = response.json()
        tracks_list = data.get("tracks", {}).get("data", [])

        for track in tracks_list:
            song_id = str(track["id"])
            preview = track.get("preview")

            # verificam sa aiba audio si sa nu fi fost adaugata deja
            if preview and song_id not in seen_ids:
                seen_ids.add(song_id)
                audio_path = audio_dir / f"{song_id}.mp3"

                if not audio_path.exists():
                    audio_content = requests.get(preview).content
                    with open(audio_path, "wb") as af:
                        af.write(audio_content)

                tracks.append({
                    "song_id": song_id,
                    "song_name": track["title"],
                    "artist_name": track["artist"]["name"],
                    "audio_url": f"/audio/{song_id}.mp3"
                })

    output_file = generate_path()
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(tracks, f, indent=2, ensure_ascii=False)

    print(f"S-au salvat {len(tracks)} melodii unice în songs.json.")

def generate_path():
    current_dir = Path(__file__).parent.parent
    return current_dir / "songs_bad_bunny.json"

fetch_and_save_playlist()