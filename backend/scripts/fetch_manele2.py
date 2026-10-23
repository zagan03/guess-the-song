import json
from pathlib import Path
import requests

PLAYLIST_IDS = [
    "302333227",
    "180249622",
    "9539018",
    "299484812",
    "512542901",
    "654859161",
    "300186317",
    "9125399",
    "512186281",
    "625078931",
    "10617050",
    "514237082",
    "512034931",
    
]


def fetch_and_save_playlist():
  current_dir = Path(__file__).parent.parent
  audio_dir = current_dir / "audio"
  audio_dir.mkdir(parents=True, exist_ok=True)

  output_file = generate_path()

  tracks = []
  seen_ids = set()

  if output_file.exists():
    with open(output_file, "r", encoding="utf-8") as f:
      try:
        tracks = json.load(f)
        for track in tracks:
          seen_ids.add(str(track["song_id"]))
      except json.JSONDecodeError:
        print(
            "Fișierul JSON existent era gol sau corrupt. Începem o listă"
            " nouă."
        )

  initial_count = len(tracks)

  for playlist_id in PLAYLIST_IDS:
    api_url = f"https://api.deezer.com/album/{playlist_id}"
    response = requests.get(api_url)

    if response.status_code != 200:
      print(f"Eroare la playlist-ul/albumul {playlist_id}: {response.status_code}")
      continue

    data = response.json()
    tracks_list = data.get("tracks", {}).get("data", [])

    for track in tracks_list:
      song_id = str(track["id"])
      preview = track.get("preview")


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
            "audio_url": f"/audio/{song_id}.mp3",
        })


  with open(output_file, "w", encoding="utf-8") as f:
    json.dump(tracks, f, indent=2, ensure_ascii=False)

  added_count = len(tracks) - initial_count
  print(
      f"S-au adăugat {added_count} piese noi. Total piese în songs.json:"
      f" {len(tracks)}."
  )


def generate_path():
  current_dir = Path(__file__).parent.parent / "songs"
  return current_dir / "songs.json"


if __name__ == "__main__":
  fetch_and_save_playlist()