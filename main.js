export const canvas = document.getElementById("c")
        ,   ctx = canvas.getContext("2d")

export const globalPolygons = []
        ,   globalBots = []
        ,   player = null

import { Spawner } from "./spawner.js"
export const camera = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
}

function darkenRGB(rgb, darken) {
    if (typeof rgb !== "string") {
        console.error("Invalid input to darkenRGB:", rgb);
        return "rgb(0, 0, 0)";
    }

    let match = rgb.match(/\d+/g)
    if (!match || match.length < 3) return rgb; 
    
    let r = Math.max(0, parseInt(match[0], 10) - darken);
    let g = Math.max(0, parseInt(match[1], 10) - darken);
    let b = Math.max(0, parseInt(match[2], 10) - darken);

    return `rgb(${r}, ${g}, ${b})`;
}
canvas.width = 7500
canvas.height = 7500

import { updateCamera } from "./miscellaneous.js"

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
class Polygon {
    constructor(x, y, sides) {
        this.x = x;
        this.angle = 0
        this.radiant = 0
        this.r = 255;
        this.g = 0;
        this.b = 0;
        this.health = 35 * Math.pow(3.6, sides)
        this.maxHealth = 35 * Math.pow(3.6, sides)
        this.xp = 2*(Math.pow(5,sides)) * (this.misshapen ? 10 : 1)
        this.misshapen = Math.random() < 0.01
        this.y = y;
        this.pushX = 0
        this.pushY = 0
        this.velX = 0.75 / Math.pow(1.6, (sides-3))
        this.velY = 0.75 / Math.pow(1.6, (sides-3))
        this.size = 10 * Math.pow(1.55, (sides-3))
        this.sides = this.misshapen ? (sides == 3) ? 3 + 1 + Math.ceil(Math.random() * 10) : sides -1+(Math.ceil(Math.random()*6)) : sides;
        let index = Math.min(Math.max(sides - 3, 0), polygonColors.length - 1);
        this.color = polygonColors[index];
        this.radiantMode = 0
        this.border = darkenRGB(this.color, 20);
    }
    radiantB() {
        // to do: radiant
    }
    draw() {
        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x-camera.x, this.y-camera.y)
        ctx.rotate(this.angle)
        ctx.lineJoin = "round"
        ctx.moveTo(this.size * Math.cos(0), this.size * Math.sin(0))
        for (let i = 0; i < this.sides+1.2; i++) {
            ctx.lineTo(
                this.size * Math.cos((i * 2 * Math.PI) / this.sides),
                this.size * Math.sin((i * 2 * Math.PI) / this.sides),
            );
        }
        ctx.fillStyle = this.color
        ctx.lineWidth = 3
        ctx.strokeStyle = this.radiant ? darkenRGB(updateColor(this.r, this.g, this.b, 3, 0), 15) : this.border
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.beginPath()
        ctx.fillStyle = darkenRGB(this.color, 15);
        ctx.lineWidth = 3
        ctx.strokeStyle = darkenRGB(this.color, 15)
        ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+10 - camera.y, this.size*2, 5, 5)
        ctx.fill()
        ctx.stroke()        
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+10 - camera.y, (this.size*2)*(this.health / this.maxHealth), 5, 5)
        ctx.fill()
        ctx.closePath()
        this.health -= this.maxHealth/500
    }
    move() {
        this.angle += 0.05/this.size

        this.x += this.pushX
        this.y += this.pushY

        this.x += this.velX*Math.cos(this.angle)
        this.y += this.velY*Math.sin(this.angle)
    }
}
let sp = new Spawner(0, 500, 8, Polygon, globalPolygons, canvas)

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

        if (poly.health <= 0) {
            globalPolygons.splice(globalPolygons.indexOf(poly), 1)
            sp.currentPolys--
        }
    })
},1000/15)
function checkXPs() {
    for (let i = 3; i <= 10; i++) {
        console.log(2*(Math.pow(5,i)))
    }
}

function makeGrid(cellSize) {
    ctx.beginPath()
    for (let i = 10; i < canvas.width; i += cellSize) {
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
    }
    
    for (let i = 10; i < canvas.height; i += cellSize) {
        ctx.moveTo(0-camera.x, i-camera.y)
        ctx.lineTo(canvas.width-camera.x, i-camera.y)
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.closePath()
}

checkXPs()
setInterval(() => {
    globalPolygons.forEach((poly) => {
        poly.move()
        poly.pushX *= 0.93
        poly.pushY *= 0.93
    })
},1000/60)
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    //updateCamera()
    makeGrid(20)
    globalPolygons.forEach((poly) => {
        poly.draw()
    })
    requestAnimationFrame(render)
}
render()