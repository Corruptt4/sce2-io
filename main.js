export const canvas = document.getElementById("c")
        ,   ctx = canvas.getContext("2d")

export const globalPolygons = []
        ,   globalBots = []
        ,   player = null

import { Spawner } from "./spawner.js"

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;

    let r, g, b;
    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
    else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
    else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
    else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}

// Example Usage
console.log(hslToRgb(200, 100, 50)); // Output: [0, 170, 255]

function darkenRGB(rgb, darken) {
    if (typeof rgb !== "string") {
        console.error("Invalid input to darkenRGB:", rgb);
        return "rgb(0, 0, 0)";
    }

    let match = rgb.match(/\d+/g)
    if (!match || match.length < 3) return rgb; // Ensure valid RGB format
    
    let r = Math.max(0, parseInt(match[0], 10) - darken);
    let g = Math.max(0, parseInt(match[1], 10) - darken);
    let b = Math.max(0, parseInt(match[2], 10) - darken);

    return `rgb(${r}, ${g}, ${b})`;
}
canvas.width = 5000
canvas.height = 5000

export var polygonColors = [
    "rgb(255, 228, 107)",
    "rgb(252, 118, 118)",
    "rgb(118, 140, 252)",
    "rgb(252, 166, 68)",
    "rgb(56, 183, 100)",
    "rgb(74, 102, 189)",
    "rgb(93, 39, 93)",
    "rgb(26, 28, 44)",
    "rgb(6, 0, 17)",
    "rgb(64, 54, 69)",
    "rgb(237, 237, 255)",
    "rgb(0, 0, 0)"
];
// polygonColors[((this.level) > polygonColors.length ? (polygonColors.length-1) : (this.level))]
export class Polygon {
    constructor(x, y, sides) {
        this.x = x;
        this.angle = 0
        this.radiant = 2
        this.hslVal = 0
        this.y = y;
        this.pushX = 0
        this.pushY = 0
        this.velX = 0.4 / Math.pow(1.6, (sides-3))
        this.velY = 0.4 / Math.pow(1.6, (sides-3))
        this.size = 10 * Math.pow(1.55, (sides-3))
        this.sides = sides;
        let index = Math.min(Math.max(sides - 3, 0), polygonColors.length - 1);
        this.color = polygonColors[index];
        this.border = darkenRGB(this.color, 20);
    }
    draw() {
        if (this.radiant) {
            this.hslVal++
            if (this.hslVal >= 360) {
                this.hslVal = 0
            }
        }
        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.moveTo(this.size * Math.cos(0), this.size * Math.sin(0))
        for (let i = 0; i < this.sides+1.2; i++) {
            ctx.lineTo(
                this.size * Math.cos((i * 2 * Math.PI) / this.sides),
                this.size * Math.sin((i * 2 * Math.PI) / this.sides),
            );
        }
        ctx.fillStyle = this.radiant ? `hsl(${this.hslVal}, 100%, 50%)` : this.color
        ctx.lineWidth = 3
        ctx.strokeStyle = this.radiant ? darkenRGB(hslToRgb(this.hslVal, 100, 50), 15) : this.border
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }
    move() {
        this.angle += 0.05/this.size

        this.x += this.pushX
        this.y += this.pushY

        this.x += this.velX*Math.cos(this.angle)
        this.y += this.velY*Math.sin(this.angle)
    }
}
let sp = new Spawner(0, 150, 9, Polygon, globalPolygons, canvas)

setInterval(()=>{
    sp.spawnLoop()
},200)

setInterval(() => {
    globalPolygons.forEach((poly) => {

        for (let i = 0; i < globalPolygons.length; i++) {
            let poly2 = globalPolygons[i]
            if (poly2 != poly) {
                let dist = Math.sqrt(Math.pow(poly.x - poly2.x, 2) + Math.pow(poly.y - poly2.y, 2))
                if (dist < (poly.size+poly2.size)) {
                    let angle = Math.atan2(poly.y - poly2.y, poly.x - poly2.x)
                    poly.pushX += (3 * Math.cos(angle))/poly.size
                    poly.pushY += (3 * Math.sin(angle))/poly.size
                    
                    poly2.pushX -= (3 * Math.cos(angle))/poly2.size
                    poly2.pushY -= (3 * Math.sin(angle))/poly2.size
                }
            }
        }
    })
},1000/15)
setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    globalPolygons.forEach((poly) => {
        poly.draw()
        poly.move()
        poly.pushX *= 0.93
        poly.pushY *= 0.93
    })
},1000/60)