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
        for (let i = 0; i <= 100; i++) {
            this.radiants.push(
                [["Radiant", "Gleaming", "Luminous", "Lustrous", "Highly Radiant"]
                [(i<5) ? i : 4], 1/(this.radiantChance*Math.pow(9, i-1)), i]
            )
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
        let polys = []
        let nested = []
        for (let i = 3; i <= 503; i++) {
            polys.push([i, 1/Math.pow(2.23, i-3)])
        }
        for (let i = 11; i <= 503; i++) {
            nested.push([i, 1/Math.pow(2.63, i-11)])
        }
        if (this.currentPolys < this.maxPoly) {
            let randX = Math.random() * this.canvas.width
            let randY = Math.random() * this.canvas.height
           for (let i = 0; i < 1 + Math.ceil(Math.random()*this.clumpSpawn); i++) {
                let random = Math.random()
                polys.forEach((pol) => {
                    if (random < pol[1]) {
                        this.spawn(pol[0], randX, randY)
                    }
                })
           }
           if (Math.random() < 0.03 && this.maxSides >= 10) {
                let random = Math.random()
                nested.forEach((pol) => {
                    if (random < pol[1]) {
                        this.spawn(pol[0], randX, randY)
                    }
                })
           }
        }
    }
}
