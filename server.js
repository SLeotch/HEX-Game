const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require("fs");

let nomsJoueurs = [];

let indexActuel = 0;
let nbMinJoueur = 2;
const nbJoueursMax = 2;

server.listen(8888, () => {
    console.log("Le serveur écoute sur le port 8888");
});

app.get("/", (request, response) => {
    response.sendFile("/client/client.html", { root: __dirname });
});

app.use(function (req, res, next) {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://d3js.org; style-src 'self';"
    );
    next();
});

app.use(express.static(__dirname));

const couleurs = ["red", "blue"];
const joueurs = {};
const hexagones = [];
const histMove = [];

for (var i = 0; i < 11 * 11; i++) {
    hexagones.push(null);
}
// Une case vaut null quand elle est libre, l'id du joueur sinon

function reconstruireHex(momentHist) {
    if (momentHist >= 0) {
        return [...hexagones];
    }
    let sauvHexagones = [];
    for (var i = 0; i < 11 * 11; i++) {
        sauvHexagones.push(null);
    }
    let diff = momentHist + histMove.length - 1;
    for (let i = 0; i <= diff; i++) {
        sauvHexagones[histMove[i][1]] = histMove[i][0];
    }
    return sauvHexagones;
}

io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté");

    socket.on("getHistLen", () => {
        socket.emit("returnHistLen", histMove.length);
    });

    socket.on("recupererDamier", (momentHist) => {
        console.log("On veut récupérer", momentHist);
        let hex = reconstruireHex(momentHist);
        for (let i = 0; i < 11 * 11; i++) {
            if (hex[i] === null) {
                hex[i] = "white";
            } else {
                hex[i] = couleurs[hex[i] % couleurs.length];
            }
        }
        socket.emit("miseAJourDamier", hex);
    });

    socket.on("selectionHexagone", (data) => {
        console.log(
            `Joueur ${data.numJoueur} vient de cliquer sur un hexagone`
        );

        if (!joueurs[data.numJoueur]) {
            const nbJoueurs = Object.keys(joueurs).length;
            joueurs[data.numJoueur] = couleurs[nbJoueurs % couleurs.length];
        }

        console.log(data.numJoueur, indexActuel);
        if (data.numJoueur == indexActuel) {
            if (hexagones[data.numHexagone] !== null) {
                socket.emit("message", {
                    nom: "Serveur",
                    message: "Case déjà prise",
                });
                return;
            }
            const couleurJoueur = joueurs[data.numJoueur % 2];
            hexagones[data.numHexagone] = data.numJoueur;
            indexActuel = (indexActuel + 1) % nomsJoueurs.length;
            histMove.push([data.numJoueur, data.numHexagone]);
            io.emit("colorierHexagone", {
                numHexagone: data.numHexagone,
                couleur: couleurJoueur,
            });

            if (partieFinie(data.numHexagone, hexagones)) {
                indexActuel = null;
                console.log("Partie finie");
                io.emit("message", {
                    nom: "Serveur",
                    message: "Victoire du joueur " + data.numJoueur,
                });
                // reset partie ?
            } else {
                io.emit("aCeJoueurDeJouer", {
                    pseudo: nomsJoueurs[indexActuel],
                    NumJoueurquiDoitJouer: indexActuel,
                });
            }
        } else {
            socket.emit("message", {
                nom: "Serveur",
                message: "Ce n'est pas ton tour !",
            });
        }
    });

    socket.on("entree", (nomJoueur) => {
        if (nomsJoueurs.length >= nbJoueursMax) {
            socket.emit("message", {
                nom: "Serveur",
                message: "Partie compléte, vous êtes spectateur",
            });
            return;
        }

        if (nomJoueur == null || nomsJoueurs.includes(nomJoueur)) {
            socket.emit("message", {
                nom: "Serveur",
                message: "Pseudo incorrect",
            });
            return;
        }
        nomsJoueurs.push(nomJoueur);
        socket.emit("entree", nomsJoueurs.length - 1);
        io.emit("updateJoueurs", { nomsJoueurs });

        if (nomsJoueurs.length === nbMinJoueur) {
            io.emit("aCeJoueurDeJouer", {
                pseudo: nomsJoueurs[0],
                NumJoueurquiDoitJouer: 0,
            });
        }
    });

    socket.on("sortie", (nomJoueur) => {
        console.log(`${nomJoueur} essaye de sortir`);
        const index = nomsJoueurs.indexOf(nomJoueur);
        if (index > -1) {
            nomsJoueurs.splice(index, 1);
            console.log(`${nomJoueur} est sorti de la partie`);
            io.emit("updateJoueurs", { nomsJoueurs });
        }
    });

    socket.on("message", (data) => {
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

app.post("/clear-log", (req, res) => {
    fs.writeFile("log.html", "", (err) => {
        if (err) {
            console.error("Erreur lors de l'effacement du fichier log:", err);
            res.status(500).send("Erreur serveur.");
        } else {
            console.log("Fichier log effacé.");
            res.send("Fichier log effacé.");
        }
    });
});

/**
 * Détermine si la case placée permet de terminer la partie
 *
 * @param {number} numero_case Le numéro de la case qui vient d'être placée
 * @param {object} terrain La liste des cases du terrain
 * @returns {Boolean} Partie terminée ou non
 */
function partieFinie(numero_case, terrain) {
    // console.log("Appel à partieFinie avec " + numero_case);
    /* Si on peut rejoindre chacun des bords à rejoindre depuis la case donnée, 
     alors ça signifie que la partie est finie */
    bords_a_rejoindre(terrain[numero_case]).forEach((b) => {
        console.log(
            b +
                " depuis " +
                numero_case +
                " : " +
                peutAtteindre(b, numero_case, terrain)
        );
    });

    return bords_a_rejoindre(terrain[numero_case]).every((b) =>
        peutAtteindre(b, numero_case, terrain)
    );
}

/**
 * Donne les deux bords à rejoindre pour un joueur
 *
 * @param {number} joueur L'identifiant du joueur
 * @returns {object} Liste des bords entre ["haut", "bas"] et ["gauche", "droite"]
 */
function bords_a_rejoindre(joueur) {
    if (joueur % 2 == 0) return ["gauche", "droite"]; // rouge, numéro pair
    if (joueur % 2 == 1) return ["haut", "bas"]; // bleus, numéro impair
}

/**
 * Dit si on peut atteindre un côté depuis une case
 *
 * @param {string} destination Le côté à atteindre (parmi "haut", "bas", "gauche", "droite")
 * @param {number} numero_case Le numéro de la case de départ
 * @param {object} terrain La liste des cases du terrain
 *
 * @returns {boolean} Si la destination est accessible ou non
 */
function peutAtteindre(destination, numero_case, terrain) {
    /*console.log(
        "Appel à peutAtteindre vers " + destination + " depuis " + numero_case
    );*/
    // Cas où la case est sur un bord spécifique
    if (numero_case < 11 && destination === "haut") return true;
    if (numero_case % 11 === 0 && destination === "gauche") return true;
    if (numero_case > 109 && destination === "bas") return true;
    if (numero_case % 11 === 10 && destination === "droite") return true;

    // Parcours en profondeur itératif
    pile = [numero_case];
    visited = new Set();

    while (pile.length > 0) {
        let current = pile.pop();

        if (visited.has(current)) continue;
        visited.add(current);

        if (current < 11 && destination === "haut") return true;
        if (current % 11 === 0 && destination === "gauche") return true;
        if (current > 109 && destination === "bas") return true;
        if (current % 11 === 10 && destination === "droite") return true;
        for (let voisin of voisins(current, terrain)) {
            if (!visited.has(voisin)) {
                pile.push(voisin);
            }
        }
    }

    // Si on a exploré toutes les cases accessibles sans atteindre la destination
    return false;
}

function divmod(a, b) {
    return [Math.floor(a / b), a % b];
}

/**
 * Retourne vrai si deux cases sont adjacentes
 *
 * @param {number} destination La case de destination
 * @param {number} origine La case d'origine
 * @returns {Boolean}
 */
function adjacente(origine, destination) {
    let [x1, y1] = divmod(origine, 11);
    let [x2, y2] = divmod(destination, 11);

    return (
        ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5 < 2 &&
        [-11, -10, -1, 1, 10, 11].includes(origine - destination)
    );
}

/**
 * Retourne la liste des voisins d'une case qui sont au même joueur
 *
 * @param {number} numero_case Le numéro de la case
 * @param {object} terrain La liste des cases du terrain
 *
 * @returns {object} La liste des voisins
 */
function voisins(numero_case, terrain) {
    retour = [];

    [-11, -10, -1, 1, 10, 11].forEach((positionRelative) => {
        if (
            typeof terrain[numero_case] == "number" &&
            typeof terrain[numero_case + positionRelative] == "number" &&
            terrain[numero_case + positionRelative] % 2 ==
                terrain[numero_case] % 2
        ) {
            if (adjacente(numero_case, numero_case + positionRelative)) {
                retour.push(numero_case + positionRelative);
            }
        }
    });
    return retour;
}
