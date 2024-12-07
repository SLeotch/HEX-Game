var socket = io();

function entrerDansLaPartie() {
    const nomJoueur = document.getElementById("nom").value;
    if (nomJoueur) {
        socket.emit("entree", nomJoueur);
    }
}

function sortirDeLaPartie() {
    const nomJoueur = document.getElementById("nom").value;
    if (nomJoueur) {
        socket.emit("sortie", nomJoueur);
    }
}

socket.on("updateJoueurs", (data) => {
    const nomJoueursTextArea = document.getElementById("nomsJoueurs");
    nomJoueursTextArea.value = data.nomsJoueurs.join("\n");
});

function envoyerMessage() {
    const message = document.getElementById("messageInput").value;
    const nomJoueur = document.getElementById("nom").value;
    if (message && nomJoueur) {
        socket.emit("message", { nomJoueur, message });
        document.getElementById("messageInput").value = "";
    }
}

socket.on("message", (data) => {
    const messageJoueurTextArea = document.getElementById("messagesDisplay");
    messageJoueurTextArea.value += `${data.nomJoueur}: ${data.message}\n`;
});

function premiereConnection() {
    console.log("Appel du serveur");
    socket.emit("test", "Ô serveur je t'envoie ce message");
}

socket.on("test", (data) => {
    console.log("Réponse du serveur :");
    console.dir(data);
});

function clearLog() {
    const messagesAsuppr = document.getElementById("messagesDisplay");
    messagesAsuppr.value = "";
}

d3.selectAll("#tablier").on("click", function (d) {
    let numHexagone = parseInt(d3.select(this).attr("id").substring(1)); // pour enlever la lettre en préfixe
    let numJoueur = document.getElementById("nom").value;
    if (numJoueur) {
        socket.emit("selectionHexagone", { numJoueur, numHexagone });
        console.log("haha");
    }
});

window.addEventListener("load", () => {
    premiereConnection();
});

document.addEventListener("DOMContentLoaded", function () {
    genereDamier(30, 11, 11);
});
