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
        if (this.currentPolys < this.maxPoly && chosenSides < 9) {
            let chosenSides = 2 + Math.ceil(Math.random() * (this.maxSides - 2))
            let randX = Math.random() * this.canvas.width
            let randY = Math.random() * this.canvas.height
           for (let i = 0; i < 1 + Math.ceil(Math.random()*20); i++) {
                this.spawn(
                    chosenSides,
                    randX,
                    randY
                );
           }
           if (Math.random() < 0.1 && this.maxSides >= 11) {
                let chosenSides = 11 + Math.ceil(Math.random() * (this.maxSides - 11))
                let x = Math.random() * 600 + (this.canvas.width / 2 - 300)
                let y = Math.random() * 600 + (this.canvas.width / 2 - 300)
                this.spawn(chosenSides, x, y)
           }
        }
    }
}
