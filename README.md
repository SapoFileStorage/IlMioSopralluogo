# Rilievo sopralluogo

Web-app **offline** per il rilievo sul campo: mappa i punti di interesse durante un sopralluogo, scatta foto, tieni traccia della posizione GPS e porti a casa i dati pronti per il tuo GIS. Tutto in un **unico file HTML**, senza installazioni né server: i dati restano sul tuo dispositivo.

È una **PWA** (Progressive Web App): la puoi aggiungere alla schermata Home del telefono e usarla come un'app normale, anche senza connessione.

---

## Caratteristiche

- **Funziona offline.** Dopo la prima apertura, mappa e applicazione restano disponibili senza rete grazie al service worker.
- **Nessun server, nessun account.** Rilievi e foto sono salvati localmente nel browser (IndexedDB): i dati non lasciano il dispositivo finché non li esporti tu.
- **Progetto personalizzabile.** Nome del progetto e **categorie del rilievo** le definisci tu; durante il sopralluogo scegli rapidamente la categoria (o ne digiti una libera con «Altro…»).
- **Foto e posizione.** Scatti dalla fotocamera e registri la posizione GPS del punto (rilevamento singolo o continuo).
- **Layer di punti come extra opzionale.** Puoi caricare i tuoi layer già preparati — ma l'app funziona benissimo anche senza: puoi iniziare a mappare da subito.
- **Planimetrie georiferite** come overlay sulla mappa, da immagini o da GeoTIFF.
- **Esportazione** in GeoJSON, KMZ e report per portare i dati in ufficio.

---

## Formati supportati

### Layer di punti (in importazione)
- **GeoJSON** (`.geojson`, `.json`)
- **KML** e **KMZ** (Google Earth)
- **GPKG** (GeoPackage / QGIS)

Punti, multipunti, linee e poligoni sono tutti supportati: per linee e poligoni viene usato il **baricentro** come posizione del marker. Per ogni layer scegli il campo dell'etichetta e il colore (fisso o per campo).

**Riproiezione automatica del sistema di riferimento.** Il CRS viene letto direttamente dal file (codice EPSG e/o WKT) e i punti vengono riproiettati in WGS84:
- UTM su WGS84/ETRS89 (es. EPSG 32632/32633, 25832/25833, RDN2008): precisione sotto il millimetro;
- sistemi con cambio di datum come **Monte Mario / Gauss-Boaga** (3003/3004) ed **ED50**: gestiti con lo spostamento di datum;
- se un sistema non viene riconosciuto, i punti vengono comunque importati e compare un **avviso** che potrebbero risultare fuori posizione.

### Planimetrie (overlay georiferiti)
- **GeoTIFF** (`.tif`, `.tiff`, `.geotiff`): la georeferenziazione viene letta dai tag del file e la planimetria è posizionata **automaticamente**, senza inserire gli angoli a mano. Anche il CRS del GeoTIFF viene riproiettato in WGS84.
- **Immagini** (`.jpg`, `.png`): si inseriscono i 4 angoli in WGS84 (in basso-sinistra SUD/OVEST e in alto-destra NORD/EST), leggibili dal proprio GIS o con «Usa i limiti dei punti».

---

## Struttura del pacchetto

La web-app è composta da **6 file**, che vanno caricati **tutti insieme nella stessa cartella**:

```
index.html              ← l'applicazione (unico file, tutto incluso)
sw.js                   ← service worker (funzionamento offline)
manifest.webmanifest    ← metadati PWA (nome, icone, installazione)
icon-192.png            ← icona app
icon-512.png            ← icona app
.nojekyll               ← file vuoto: evita che GitHub Pages ignori alcuni file
```

Se manca `sw.js`, `manifest.webmanifest`, un'icona o `.nojekyll`, l'app funziona lo stesso in parte ma perde l'installabilità e/o il funzionamento offline.

---

## Pubblicazione su GitHub Pages

L'app è interamente statica e usa **solo percorsi relativi**, quindi funziona sia pubblicata alla radice del dominio sia in una sottocartella di progetto.

1. Crea un repository su GitHub e carica al suo interno i **6 file** elencati sopra (la radice del repo va benissimo).
   - `.nojekyll` inizia con un punto: se il caricamento da browser dà problemi, usa **Add file → Create new file**, chiamalo `.nojekyll` e lascialo vuoto.
2. Vai su **Settings → Pages**.
3. In *Build and deployment* scegli **Deploy from a branch**, seleziona il branch `main` e la cartella `/ (root)`, poi **Save**.
4. Dopo circa un minuto Pages pubblica l'indirizzo, del tipo `https://tuo-utente.github.io/nome-repo/`.
5. Aprilo dal telefono e usa **«Aggiungi a schermata Home»** per installarlo.

> **HTTPS obbligatorio.** Service worker, geolocalizzazione e fotocamera funzionano solo su connessione sicura: GitHub Pages fornisce HTTPS automaticamente.

### Aggiornare l'app in futuro
Il service worker usa una strategia *network-first*: quando carichi una nuova versione di `index.html`, basta riaprire l'app (o chiuderla e riaprirla una volta) per vederla aggiornata, senza restare bloccati su una versione in cache.

---

## Come si usa sul campo

1. **Prepara il progetto** (facoltativo): dai un nome al progetto e definisci le categorie. Se vuoi, carica layer di punti e/o planimetrie di riferimento.
2. **Rileva i punti**: posizionati sulla mappa, scegli la categoria, aggiungi note e foto, registra la posizione GPS.
3. **Rivedi** l'elenco dei rilievi della giornata direttamente nell'app.
4. **Esporta** a fine giornata (GeoJSON / KMZ / report) e porta i dati in ufficio.

---

## Note tecniche

- **Un solo file, zero build.** `index.html` contiene HTML, CSS, JavaScript e la libreria di mappa (Leaflet) già incorporati. Non serve Node, npm o alcun passaggio di compilazione.
- **Compatibilità.** Il codice è scritto in JavaScript ES5 per funzionare anche su dispositivi e browser meno recenti (incluse versioni datate di Safari iOS).
- **Dati locali.** I rilievi e le foto sono salvati in IndexedDB (database `sopralluogo_app`). Cancellare i dati del sito dal browser **elimina** anche i rilievi non esportati: esporta prima di pulire.
- **Import/parser offline.** I lettori di KML/KMZ/GPKG/GeoTIFF e il motore di riproiezione sono implementati internamente, senza dipendenze esterne: tutto avviene nel browser.

### Limitazioni note
- **GeoTIFF**: sono supportati file a **8 bit** (grigio, RGB, RGBA, palette), compressione *none / LZW / DEFLATE / PackBits*, organizzati a strisce o a tile. **Non** sono supportati 16 bit/float, JPEG-dentro-TIFF e immagini ruotate: in questi casi compare un avviso e si può ripiegare su PNG/JPG con inserimento manuale dei 4 angoli.
- **CRS non riconosciuti**: se un GPKG o un GeoTIFF usa un sistema di riferimento non gestito, i dati vengono importati ma con un avviso di possibile posizionamento errato.

---

## Licenza

_Aggiungi qui la licenza che preferisci (es. MIT) creando un file `LICENSE` nel repository._
