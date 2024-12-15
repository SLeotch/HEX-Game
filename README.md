# Projet Hex - Jeu de Hex en Ligne

Bienvenue dans le projet Hex, une implémentation du jeu de Hex en ligne avec un mode spectateur.

## Fonctionnalités

- Jeu de Hex en ligne pour deux joueurs.
- Gestion des tours et de l'état de la partie.
- Affichage en temps réel grâce à **Socket.IO**.
- Mode spectateur : un utilisateur peut rejoindre la partie en tant que spectateur pour suivre l’évolution du jeu.

## Installation et Lancement

1. Téléchargez le dossier `.zip` contenant tous les fichiers nécessaires au projet.
2. Décompressez le dossier `.zip` dans le répertoire de votre choix.
3. Assurez-vous d'avoir **Node.js** installé sur votre système.
4. Depuis un terminal, naviguez vers le dossier décompressé et installez les dépendances (express, node, npm...) :

```bash
    pip install ...
    npm install ...
```

5. Lancer le serveur : 

```bash
    node serveur.js
```

6. Ouvrez votre navigateur et accédez à l'adresse suivante pour commencer à jouer :

```bash
    http://localhost:8888
```

## Structure des fichiers

- index.html : Fichier HTML principal pour le client.
- style.css : Feuille de style pour l'interface utilisateur.
- client.js : Code JavaScript côté client pour gérer les interactions et les communications avec le serveur.
- serveur.js : Serveur Node.js utilisant Socket.IO pour gérer les connexions, les tours de jeu et le mode spectateur.

## Notes

- Le mode spectateur permet à plusieurs utilisateurs de se connecter sans interférer avec les joueurs actifs.
- Assurez-vous que le port 8888 est disponible sur votre machine avant de lancer le serveur.
