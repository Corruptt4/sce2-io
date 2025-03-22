
export class Spawner {
    constructor(currentPolys, maxPoly, maxSides) {
        this.currentPolys = currentPolys
        this.maxPoly = maxPoly
        this.maxSides = maxSides
    }

    async spawn(chosenSides, x, y) {
        console.log("Spawning!")
        let poly = new Polygon(x, y, chosenSides)
        globalPolygons.push(poly)
        this.currentPolys++
    }

    async spawnLoop() {
        if (this.currentPolys < this.maxPoly) {
            this.spawn(3+(Math.ceil(Math.random()*(this.maxSides-3))), Math.random()*canvas.width, Math.random()*canvas.height)
        }
    }
}
import { Polygon, globalPolygons, canvas } from "./main.js"