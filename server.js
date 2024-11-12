// Szükséges modulok betöltése
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // JSON kérések feldolgozása
app.use(express.json()); 

// Adatbázis kapcsolat beállítása
const db = mysql.createConnection({
  host: 'mysql.nethely.hu',       // A Nethely adatbázis IP-címe
  user: 'basketballgame',         // Adatbázis felhasználónév
  password: 'Mogyi2004',             // Adatbázis jelszó
  database: 'basketballgame',     // Az adatbázis neve
  port: 3306                      // Az SQL port, pl. 3306 (ellenőrizd a Nethely dokumentációjában)
});

// Kapcsolódás az adatbázishoz
db.connect(err => {
  if (err) {
    console.error('Nem sikerült csatlakozni az adatbázishoz:', err);
    return;
  }
  console.log('Kapcsolódás sikeres az adatbázishoz');
});
// Adat lekérdezése az adatbázisból (GET kérés)
app.get('/getData', (req, res) => {
  const query = 'SELECT * FROM players';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lekérdezési hiba:', err);
      res.status(500).json({ error: 'Hiba történt a lekérdezés során.' });
      return;
    }
    res.json(results);
  });
});

// Szint növelése adott játékosnál
app.post('/updateLevel', (req, res) => {
  // Logoljuk a bejövő adatokat
  console.log("Bejövő adat:", req.body); 

  const { newLevel, pontok, lepattanok, passzok, vedes, lopas, texp, kellxp, meccsek, fejlesztheto,w,l,allpoint,allrebound,allassist,allblock,allsteal, playerId} = req.body;

  const query = 'UPDATE players SET lvl = ?, point = ?, rebound = ?, assist = ?, block = ?, steal = ?, yourxp = ?, needxp = ?, matches = ?, skill = ?, w=?,l=?, allpoint = ?, allrebound = ?, allassist = ?, allblock = ?, allsteal = ? WHERE id = ?';
  
  // Logoljuk a SQL lekérdezést is, hogy lássuk, mi kerül futtatásra
  console.log("SQL lekérdezés:", query, [newLevel, pontok, lepattanok, passzok, vedes, lopas, texp, kellxp, meccsek, fejlesztheto,w,l,allpoint,allrebound,allassist,allblock,allsteal, playerId]);

  db.query(query, [newLevel, pontok, lepattanok, passzok, vedes, lopas, texp, kellxp, meccsek, fejlesztheto,w,l,allpoint,allrebound,allassist,allblock,allsteal, playerId], (err, result) => {
    if (err) {
      console.error('Frissítési hiba:', err); // Logoljuk a hibát, ha van
      res.status(500).json({ error: 'Frissítési hiba történt.' });
      return;
    }

    console.log("Frissítési siker:", result); // Logoljuk a sikeres frissítést
    res.json({ message: 'Szint sikeresen frissítve.' });
  });
});

// Szerver indítása
app.listen(3002, () => {
  console.log('Szerver fut: http://localhost:3002');
});
