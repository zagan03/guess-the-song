# 🎵 Guess the Song 

Un joc interactiv web bazat pe preview-uri audio, unde jucătorii trebuie să recunoască melodia dintr-un fragment scurt. De la hituri internaționale pop până la manele vechi.

## 🚀 Funcționalități
* **Selecție Categorii:** Alege între Manele, Bad Bunny, Dua Lipa, Ed Sheeran, Ariana Grande și Taylor Swift.
* **Redare Audio Rapidă:** Preview-uri MP3 servite direct din folderele statice locale.
* **Validare Răspunsuri:** Sistem de verificare în timp real a ghicirilor, cu mesaje personalizate.* **Bază de date scalabilă:** Sistem inteligent de scraping (Deezer API) pentru a adăuga melodii noi fără a crea duplicate.

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI, Uvicorn
* **Frontend:** HTML, CSS, JavaScript (Vanilla / Fetch API)
* **Procesare Date:** Scripturi custom Python (`requests`, `json`) pentru descărcarea melodiilor și popularea fișierelor JSON.

## 📦 Instalare și Rulare

1. **Clonează proiectul și instalează dependențele pentru backend:**
   ```bash
   pip install fastapi uvicorn pydantic requests
   ```

2. **Pornește serverul FastAPI:**
   Asigură-te că te afli în folderul unde ai fișierul de backend (ex. `main.py` sau `app.py`) și rulează:
   ```bash
   uvicorn main:app --reload
   ```
   *Serverul va porni pe `http://127.0.0.1:8000` și va expune automat folderul `/audio`.*

3. **Deschide jocul:**
   Deschide fișierul `index.html` în browserul preferat (sau folosește extensia Live Server din VS Code). 

## 🎵 Adăugarea de piese noi
Proiectul include un script Python care folosește API-ul Deezer pentru a extinde baza de date de melodii.
1. Adaugă ID-urile noilor albume sau playlist-uri în lista `PLAYLIST_IDS` din script.
2. Rulează scriptul. Acesta va descărca automat MP3-urile lipsă în folderul `/audio` și va face *append* noilor melodii în fișierul corespunzător (ex. `songs.json`), evitând duplicatele.
3. Dă un restart la serverul FastAPI pentru a încărca noile fișiere JSON în memorie.