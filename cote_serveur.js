const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

let nomsJoueurs = [];
const nbJoueursMax = 4;

server.listen(8888, () => {
    console.log('Le serveur écoute sur le port 8888');
});

app.get('/', (request, response) => {
    response.sendFile('cote_client.html', { root: __dirname });
});

app.use(express.static(__dirname));

const couleurs = ['red', 'blue', 'green', 'yellow'];
let joueurs = {};

io.on('connection', (socket) => {
    console.log("Un utilisateur s'est connecté");

    socket.on('selectionHexagone', (data) => {
        console.log(`Joueur ${data.numJoueur} vient de cliquer sur un hexagone`);

        if (!joueurs[data.numJoueur]) {
            const nbJoueurs = Object.keys(joueurs).length;
            joueurs[data.numJoueur] = couleurs[nbJoueurs % couleurs.length];
        }
        const couleurJoueur = joueurs[data.numJoueur]; 
        io.emit('colorierHexagone', { numHexagone: data.numHexagone, couleur: couleurJoueur });
    });

    socket.on('entree', (nomJoueur) => {
        if (nomsJoueurs.length < nbJoueursMax) {
            nomsJoueurs.push(nomJoueur);
            console.log(`${nomJoueur} est entré dans la partie`);
            io.emit('updateJoueurs', { nomsJoueurs });
        } else {
            socket.emit('message', { nomJoueur: 'Serveur', message: 'La partie est complète.' });
        }
    });

    socket.on('sortie', (nomJoueur) => {
        const index = nomsJoueurs.indexOf(nomJoueur);
        if (index > -1) {
            nomsJoueurs.splice(index, 1);
            console.log(`${nomJoueur} est sorti de la partie`);
            io.emit('updateJoueurs', { nomsJoueurs });
        }
    });

    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

app.post('/clear-log', (req, res) => {
    fs.writeFile('log.html', '', (err) => {
        if (err) {
            console.error('Erreur lors de l\'effacement du fichier log:', err);
            res.status(500).send('Erreur serveur.');
        } else {
            console.log('Fichier log effacé.');
            res.send('Fichier log effacé.');
        }
    });
});
