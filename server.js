// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Config MySQL — adapte avec tes infos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'jeune',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Créer table si pas existante (tu peux faire ça dans MySQL directement)
async function createTable() {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS inscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      quartier VARCHAR(255),
      numero VARCHAR(50),
     
      presence VARCHAR(50),
      date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  const conn = await pool.getConnection();
  await conn.query(createQuery);
  conn.release();
}
createTable().catch(console.error);

// API POST pour inscription
app.post('/api/inscriptions', async (req, res) => {
  const { nom, quartier, numero, etablissement, niveau, presence } = req.body;

  if (!nom || !presence) {
    return res.status(400).json({ error: "Nom et présence sont obligatoires." });
  }

  try {
    const conn = await pool.getConnection();
    const insertQuery = `
      INSERT INTO inscriptions (nom, quartier, numero, presence)
      VALUES (?, ?, ?, ?)
    `;

    await conn.execute(insertQuery, [nom, quartier, numero, presence]);
    conn.release();

    res.json({ message: "Inscription enregistrée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
