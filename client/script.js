var socket = io();
var jeton = null;
var nom;

function entrerDansLaPartie() {
    const nomJoueur = document.getElementById('nom').value;
    if(nomJoueur && jeton == null){
        socket.on('entree', jeton_temp =>{
            console.log(jeton_temp);
            jeton = jeton_temp;
        });
        socket.emit('entree', nomJoueur);
        nom = nomJoueur;
        console.log(`${nom}, ${nomJoueur}`);
    }
}

function sortirDeLaPartie() {
    const nomJoueur = document.getElementById('nom').value;
    if(nomJoueur && jeton){
        jeton = null;
        socket.emit('sortie', nomJoueur);
        nom = null;
    }
}

socket.on('updateJoueurs', (data) => {
    const nomJoueursTextArea = document.getElementById('nomsJoueurs');
    nomJoueursTextArea.value = data.nomsJoueurs.join("\n");
});

function envoyerMessage(){
    const message = document.getElementById('messageInput').value;
    if(message && nom){
        console.log(`${nom}, ${message}`);
        socket.emit('message', { nom, message });
        document.getElementById("messageInput").value = ''; 
    }
} 

socket.on('message', (data) => {
const messageJoueurTextArea = document.getElementById('messagesDisplay');
messageJoueurTextArea.value += `${data.nom}: ${data.message}\n`;
});

function test() {
console.log("Appel du serveur");
socket.emit('test', "Ô serveur je t'envoie ce message");
}

socket.on('test', (data) => {
console.log('Réponse du serveur :');
console.dir(data);
});

function clearLog() {
    const messagesAsuppr = document.getElementById('messagesDisplay');
    messagesAsuppr.value = '';
}

d3.selectAll("#tablier").on("click", function(d) {
    let numHexagone = parseInt(d3.select(this).attr('id').substring(1)); // pour enlever la lettre en préfixe
    let numJoueur = document.getElementById('nom').value;
    if(numJoueur){
        socket.emit('selectionHexagone', { numJoueur, numHexagone});
        console.log("haha");
    }
});

window.addEventListener('load', () => { test(); } );

document.addEventListener("DOMContentLoaded", function () {
    genereDamier(30, 11, 11);
});