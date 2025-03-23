export const canvas = document.getElementById("c")
        ,   ctx = canvas.getContext("2d")

export const globalPolygons = []
        ,   globalBots = []

export let player = null
,     mx = null
,     my = null
,     frictionFactor = 0.93
,     shocks = []
,     bullets = []

import { Spawner } from "./spawner.js"
export const camera = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
}

export function darkenRGB(rgb, darken) {
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
import { Polygon, Shock, Player, Bullet } from "./entities.js"
player = new Player(60, 70, 20, "rgb(0, 0, 255)", 250, 90)
window.addEventListener("resize", (e) => {
    camera.width = window.innerWidth
    camera.height = window.innerHeight
})
window.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect()
    mx = e.clientX - rect.left + camera.x
    my = e.clientY - rect.top + camera.y
})
document.addEventListener("keydown", (e) => {
    player.keys[e.keyCode] = true
})
document.addEventListener("keyup", (e) => {
    player.keys[e.keyCode] = false
})
let sp = new Spawner(0, 250, 13, Polygon, globalPolygons, canvas, polygonColors)
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
                    poly.pushX += (2 * Math.cos(angle))/(poly.size/10)
                    poly.pushY += (2 * Math.sin(angle))/(poly.size/10)
                    
                    poly2.pushX -= (2 * Math.cos(angle))/(poly2.size/10)
                    poly2.pushY -= (2 * Math.sin(angle))/(poly2.size/10)
                }
            }
        }

        bullets.forEach((bullet) => {
            let dist = Math.sqrt(Math.pow(bullet.x - poly.x, 2) + Math.pow(bullet.y - poly.y, 2))
            if (dist < (poly.size + bullet.size)) {
                poly.health -= bullet.damage
                bullets.splice(bullets.indexOf(bullet), 1)
            }
        })

        if (player) {
            let dx = player.x - poly.x
            let dy = player.y - poly.y
            let dx2 = dx*dx
            let dy2 = dy*dy
            if (Math.sqrt(dx2+dy2) < (poly.size + player.size)) {
                let angle = Math.atan2(poly.y - player.y, poly.x - player.x)
                poly.pushX += (2 * Math.cos(angle))/(poly.size/10)
                poly.pushY += (2 * Math.sin(angle))/(poly.size/10)
                
                player.velX -= (2 * Math.cos(angle))/(player.size/10)
                player.velY -= (2 * Math.sin(angle))/(player.size/10)

                player.health -= poly.damage
                poly.health -= player.bodyDamage
            }
        }

        if (poly.health <= 0) {
            globalPolygons.splice(globalPolygons.indexOf(poly), 1)
            sp.currentPolys--
        }
    })
},1000/30)

function makeGrid(cellSize, camera) {
    ctx.beginPath()
    for (let i = 10; i < canvas.width; i += cellSize) {
        ctx.moveTo(i-camera.x, 0-camera.y)
        ctx.lineTo(i-camera.x, canvas.height-camera.y)
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

setInterval(() => {
    globalPolygons.forEach((poly) => {
        poly.move()
        poly.pushX *= frictionFactor
        poly.pushY *= frictionFactor
    })
    shocks.forEach((shock) => {
        shock.upd()
    })
    bullets.forEach((bul) => {
        bul.move()
        bul.desp()
    })
    if (player.keys[32]){
        player.shoot()
    }
    player.move()
    player.reload()
    player.velX *= frictionFactor
    player.velY *= frictionFactor
},1000/60)
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateCamera(player)
    makeGrid(20, camera)
    globalPolygons.forEach((poly) => {
        poly.draw()
    })
    shocks.forEach((shock) => {
        shock.draw()
    })
    bullets.forEach((bul) => {
        bul.draw()
    })
    player.draw()
    player.faceMouse()
    requestAnimationFrame(render)
}
render()