function creeHexagone(rayon) {
    var points = new Array();
    for (var i = 0; i < 6; ++i) {
        var angle = (i * Math.PI) / 3;
        var x = Math.sin(angle) * rayon;
        var y = -Math.cos(angle) * rayon;
        console.log(
            "x=" + Math.round(x * 100) / 100 + " y=" + Math.round(y * 100) / 100
        );
        points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
    }
    return points;
}

function genereDamier(rayon, nbLignes, nbColonnes) {
    const distance = rayon - Math.sin((1 * Math.PI) / 3) * rayon;
    const largeur = (nbColonnes + 11) * (1.5 * rayon) + rayon;
    const longueur = (nbLignes + 1) * (Math.sqrt(3) * rayon) + rayon;

    d3.select("#tablier")
        .append("svg")
        .attr("width", largeur)
        .attr("height", longueur);

    var hexagone = creeHexagone(rayon);
    for (var ligne = 0; ligne < nbLignes; ligne++) {
        for (var colonne = 0; colonne < nbColonnes; colonne++) {
            var d = "";
            var x, y;
            for (var h = 0; h < hexagone.length; h++) {
                x =
                    hexagone[h][0] +
                    (rayon - distance) * (2 + 2 * colonne + ligne);
                y =
                    distance * 2 +
                    hexagone[h][1] +
                    (rayon - distance * 2) * (1 + 2 * ligne) +
                    40;
                d += x + "," + y + " ";
            }
            d3.select("svg")
                .append("polygon")
                .attr("points", d.trim())
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("id", "h" + (ligne * nbColonnes + colonne))
                .on("click", function () {
                    console.log(d3.select(this).attr("id"));
                    const numHexagone = parseInt(
                        d3.select(this).attr("id").substring(1)
                    );
                    const nomJoueur = document.getElementById("nom").value;
                    if (nomJoueur) {
                        socket.emit("selectionHexagone", {
                            numJoueur: nomJoueur,
                            numHexagone,
                        });
                    }
                });
        }
    }
    socket.on("colorierHexagone", (data) => {
        d3.select("#h" + data.numHexagone).attr("fill", data.couleur);
    });
}
