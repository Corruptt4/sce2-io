export class Spawner {
    constructor(currentPolys, maxPoly, maxSides, Polygon, globalPolygons, canvas, polygonColors, clumps, chance = 5000) {
        this.currentPolys = currentPolys;
        this.maxPoly = maxPoly;
        this.maxSides = maxSides;
        this.Polygon = Polygon;
        this.globalPolygons = globalPolygons;
        this.polygonColors = polygonColors
        this.canvas = canvas;
        this.clumpSpawn = clumps
        this.radiantChance = chance
        this.radiants = []
    }

    spawn(chosenSides, x, y) {
        console.log("Spawning!");
        for (let i = 1; i <= 100; i++) {
            this.radiants.push([["Radiant", "Gleaming", "Luminous", "Lustrous", "Highly Radiant"][(i<5) ? i : 4], 1/(this.radiantChance*Math.pow(9, i-1)), i])
        }
        let chosenRad = Math.random()
        let radi = 0
        this.radiants.forEach((rad) => {
            if (chosenRad < rad[1]) {
                radi = rad[2]
            }
        })
        let poly = new this.Polygon(x, y, chosenSides, this.polygonColors, radi);
        poly.angle = Math.random() * (Math.PI * 2)
        this.globalPolygons.push(poly);
        this.currentPolys++;
    }

    spawnLoop() {
        if (this.currentPolys < this.maxPoly) {
            let randX = Math.random() * this.canvas.width
            let randY = Math.random() * this.canvas.height
           for (let i = 0; i < 1 + Math.ceil(Math.random()*this.clumpSpawn); i++) {
                let chosenSides = 2 + Math.ceil(Math.random() * (((this.maxSides > 10) ? 10 : this.maxSides) - 2))
                this.spawn(
                    chosenSides,
                    randX,
                    randY
                );
           }
           if (Math.random() < 0.03 && this.maxSides >= 10) {
                let chosenSides = 11 + Math.ceil(Math.random() * (this.maxSides - 11))
                let x = Math.random() * 600 + (this.canvas.width / 2 - 300)
                let y = Math.random() * 600 + (this.canvas.width / 2 - 300)
                this.spawn(chosenSides, x, y)
           }
        }
    }
}
