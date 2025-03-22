export class Spawner {
    constructor(currentPolys, maxPoly, maxSides, Polygon, globalPolygons, canvas) {
        this.currentPolys = currentPolys;
        this.maxPoly = maxPoly;
        this.maxSides = maxSides;
        this.Polygon = Polygon;
        this.globalPolygons = globalPolygons;
        this.canvas = canvas;
    }

    spawn(chosenSides, x, y) {
        console.log("Spawning!");
        let poly = new this.Polygon(x, y, chosenSides);
        poly.angle = Math.random() * (Math.PI * 2)
        this.globalPolygons.push(poly);
        this.currentPolys++;
    }

    spawnLoop() {
        if (this.currentPolys < this.maxPoly) {
            let randX = Math.random() * this.canvas.width
            let randY = Math.random() * this.canvas.height
           for (let i = 0; i < 1 + Math.ceil(Math.random()*15); i++) {
                this.spawn(
                    2 + Math.ceil(Math.random() * (this.maxSides - 2)),
                    randX,
                    randY
                );
           }
        }
    }
}
