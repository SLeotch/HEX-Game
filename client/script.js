var socket = io();
var numJoueur = null;
var jeton = false;
var nom;
var moveActuel = 0;
var moveActuelMinimum;

socket.emit("getHistLen");
socket.on("returnHistLen", (histLen) => {
    moveActuelMinimum = 1 - histLen;
});

function movePrecedent() {
    if (moveActuel >= moveActuelMinimum) moveActuel--;
    socket.emit("recupererDamier", moveActuel);
}

function moveSuivant() {
    if (moveActuel < 0) {
        moveActuel++;
    }
    socket.emit("recupererDamier", moveActuel);
}

function entrerDansLaPartie() {
    const nomJoueur = document.getElementById("nom").value;
    if (nomJoueur && numJoueur == null) {
        socket.on("entree", (numJoueur_temp) => {
            console.log(numJoueur_temp);
            numJoueur = numJoueur_temp;
        });
        socket.emit("entree", nomJoueur);
        nom = nomJoueur;
        console.log(`${nom}, ${nomJoueur}`);
    }
}

function sortirDeLaPartie() {
    console.log(numJoueur, "est le numJoueur");
    if (nom && numJoueur != null) {
        numJoueur = null;
        socket.emit("sortie", nom);
        nom = null;
    }
}

socket.on("updateJoueurs", (data) => {
    const nomJoueursTextArea = document.getElementById("nomsJoueurs");
    nomJoueursTextArea.value = data.nomsJoueurs.join("\n");
});

function envoyerMessage() {
    const message = document.getElementById("messageInput").value;
    if (message && nom) {
        console.log(`${nom}, ${message}`);
        socket.emit("message", { nom, message });
        document.getElementById("messageInput").value = "";
    }
}

socket.on("message", (data) => {
    const messageJoueurTextArea = document.getElementById("messagesDisplay");
    messageJoueurTextArea.value += `${data.nom}: ${data.message}\n`;
});

function test() {
    console.log("Appel du serveur");
    socket.emit("test", "Ô serveur je t'envoie ce message");
}

socket.on(
    "aCeJoueurDeJouer",
    ({ pseudo: pseudo, NumJoueurQuiDoitJouer: numJ }) => {
        if (numJoueur == numJ) {
            console.log("à moi de jouer !");
            jeton = true;
        }
        const messageJoueurTextArea =
            document.getElementById("messagesDisplay");
        messageJoueurTextArea.value += `Server : Au tour de ${pseudo} !\n`;
    }
);

socket.on("test", (data) => {
    console.log("Réponse du serveur :");
    console.dir(data);
});

function clearLog() {
    const messagesAsuppr = document.getElementById("messagesDisplay");
    messagesAsuppr.value = "";
}

window.addEventListener("load", () => {
    test();
});

socket.on("miseAJourDamier", (hexagones) => {
    console.log(hexagones);
    for (let i = 0; i < 11 * 11; i++) {
        d3.select("#h" + i).attr("fill", hexagones[i]);
    }
});

socket.on("colorierHexagone", (data) => {
    if (moveActuel === 0)
        d3.select("#h" + data.numHexagone).attr("fill", data.couleur);
    else moveActuel--;
    moveActuelMinimum--;
});

document.addEventListener("DOMContentLoaded", function () {
    genereDamier(30, 11, 11);
    socket.emit("recupererDamier", 0);
});
