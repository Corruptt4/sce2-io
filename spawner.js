import { Polygon, globalPolygons } from "./main"
export class Spawner {
    constructor(currentPolys, maxPoly, mapSize, maxSides) {
        this.currentPolys = currentPolys
        this.maxPoly = maxPoly
        this.mapSize = mapSize
        this.maxSides = maxSides
    }

    spawn(chosenSides, x, y) {
        let poly = new Polygon(x, y, chosenSides)
        globalPolygons.push(poly)
        this.currentPolys++
    }

    spawnLoop() {
        if (this.currentPolys < this.maxPoly) {
            this.spawn(3+(Math.ceil(Math.random()*(this.maxSides-3))))
        }
    }
}
