
export class Spawner {
    constructor(currentPolys, maxPoly, maxSides, Polygon, globalPolygons, mapSizeX, mapSizeY, polygonColors, clumps, chance = 5000, qt) {
        this.currentPolys = currentPolys;
        this.maxPoly = maxPoly;
        this.maxSides = maxSides;
        this.Polygon = Polygon;
        this.globalPolygons = globalPolygons;
        this.polygonColors = polygonColors
        this.mapSizeX = mapSizeX;
        this.mapSizeY = mapSizeY;
        this.clumpSpawn = clumps
        this.radiantChance = chance
        this.quadTree = qt
        this.radiants = []
    }

    spawn(chosenSides, x, y) {
        console.log("Spawning!");
        for (let i = 0; i <= 100; i++) {
            this.radiants.push(
                [["Radiant", "Gleaming", "Luminous", "Lustrous", "Highly Radiant"]
                [(i<5) ? i : 4], 1/(this.radiantChance*Math.pow(3, i-1)), i]
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
        this.quadTree.insert(poly)
        this.currentPolys++;
    }

    spawnLoop() {
        let polys = []
        let nested = []
        for (let i = 3; i <= this.maxSides-(this.maxSides-8); i++) {
            polys.push([i, 1/Math.pow(2.16, i-3)])
        }
        for (let i = 11; i <= this.maxSides; i++) {
            nested.push([i, 1/Math.pow(3.5, i-11)])
        }
        if (this.currentPolys < this.maxPoly) {
            let randX = -this.mapSizeX/2 + Math.random() * this.mapSizeX*1.5
            let randY = -this.mapSizeY/2 + Math.random() * this.mapSizeY*1.5
            let random = Math.random()
            polys.forEach((pol) => {
                if (random < pol[1]) {
                    this.spawn(pol[0], randX, randY)
                }
            })
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
