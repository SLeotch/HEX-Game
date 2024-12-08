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

    const svg = d3
        .select("#tablier")
        .append("svg")
        .attr("width", largeur)
        .attr("height", longueur);

    // Ajouter les bordures
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 5)
        .attr("height", longueur - 45)
        .attr("fill", "red");

    svg.append("rect")
        .attr("x", largeur - 145)
        .attr("y", 0)
        .attr("width", 5)
        .attr("height", longueur - 45)
        .attr("fill", "red");

    svg.append("rect")
        .attr("x", -140)
        .attr("y", 0)
        .attr("width", largeur)
        .attr("height", 5)
        .attr("fill", "blue");

    svg.append("rect")
        .attr("x", -140)
        .attr("y", longueur - 50)
        .attr("width", largeur)
        .attr("height", 5)
        .attr("fill", "blue");

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
            svg.append("polygon")
                .attr("points", d.trim())
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("id", "h" + (ligne * nbColonnes + colonne))
                .on("click", function () {
                    let numHexagone = parseInt(
                        d3.select(this).attr("id").substring(1)
                    ); // pour enlever la lettre en préfixe
                    console.log(numJoueur);
                    if (numJoueur != null) {
                        console.log("haha");
                        socket.emit("selectionHexagone", {
                            numJoueur,
                            numHexagone,
                        });
                    }
                });
        }
    }
}
