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
,     particles = []

import { Spawner } from "./spawner.js"
export const camera = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
}
export function getRadiantColor(time) {
    let r = Math.floor(127.5 * (Math.sin(time) + 1));
    let g = Math.floor(127.5 * (Math.sin(time + (2 * Math.PI / 3)) + 1));
    let b = Math.floor(127.5 * (Math.sin(time + (4 * Math.PI / 3)) + 1));

    return `rgb(${r}, ${g}, ${b})`;
}
export function abreviatedNumber(num) {
    if (num < 1e3) return num.toFixed(0)
    let abreviations = [
        "K",
        "M",
        "B",
        "T",
        "Qa",
        "Qi",
        "Sx",
        "Sp",
        "Oc",
        "No",
        "Dc",
        "UDc",
        "DDc",
        "TDc",
        "QaDc",
        "QiDc",
        "SxDc",
        "SpDc",
        "OcDc",
        "NoDc",
        "Vg",
        "UVg",
        "DVg",
        "TVg",
        "QaVg",
        "QiVg",
        "SxVg",
        "SpVg",
        "OcVg",
        "NoVg",
        "Tg"
    ]
    let index = Math.floor(Math.log10(num) / 3) - 1
    
    let shortNum = (num / Math.pow(10, (index+1)*3)).toFixed(2)
    return shortNum + abreviations[index]
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
player = new Player(60, 70, 20, "rgb(0, 0, 255)", 250, 150)
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
document.addEventListener("mousedown", (e) => {
    if (e.button == 0) {
        player.holdMouse = true
    }
})
document.addEventListener("mouseup", (e) => {
    if (e.button == 0) {
        player.holdMouse = false
    }
})
let sp = new Spawner(0, 380, 10, Polygon, globalPolygons, canvas, polygonColors, 20, 25)
setInterval(()=>{
    sp.spawnLoop()
},500)
setInterval(() => {
    globalPolygons.forEach((poly) => {
        poly.move()
        poly.pushX *= frictionFactor
        poly.pushY *= frictionFactor
        if (poly.health <= 0) {
            player.xp += poly.xp
            globalPolygons.splice(globalPolygons.indexOf(poly), 1)
            sp.currentPolys--
        }
        if (poly.radiant > 0) {
            poly.time += 0.05
        }
        if (poly.radiant >= 3 ) {
            poly.luminousStar.upd()
        }
        if (poly.radiant >= 4 ) {
            poly.lustrousStar.upd()
        }
    })
    shocks.forEach((shock) => {
        shock.upd()
    })
    bullets.forEach((bul) => {
        bul.move()
        bul.desp()
        
        if (bul.isBomb) {
            bul.velX *= frictionFactor
            bul.velY *= frictionFactor
        }
        if (bul.health < 0) {
            if (bul.isBomb) {
                bul.explode()
            }
            bullets.splice(bullets.indexOf(bul), 1)
        }
    })
    if (player.keys[32] || player.holdMouse){
        player.shoot()
    }
    
    particles.forEach((part) => {
        part.move()
        part.desp()
    })
    player.move()
    player.reload()
    player.levelUpCheck()
    player.velX *= frictionFactor
    player.velY *= frictionFactor
},1000/60)
setInterval(() => {
    for (let i = 0; i < globalPolygons.length; i++) {
        let poly2 = globalPolygons[i]
        for (let k = 0; k < globalPolygons.length; k++) {
            let poly = globalPolygons[k]
            if (poly2 != poly) {
                let dist = Math.sqrt(Math.pow(poly.x - poly2.x, 2) + Math.pow(poly.y - poly2.y, 2))
                if (dist.toFixed(0) < (poly.size+poly2.size)) {
                    let angle = Math.atan2(poly.y - poly2.y, poly.x - poly2.x)
                    poly.pushX += (5 * Math.cos(angle))/(poly.size/5)
                    poly.pushY += (5 * Math.sin(angle))/(poly.size/5)
                    
                    poly2.pushX -= (5 * Math.cos(angle))/(poly2.size/5)
                    poly2.pushY -= (5 * Math.sin(angle))/(poly2.size/5)
                }
            }
        }
    }
    globalPolygons.forEach((poly) => {
        bullets.forEach((bullet) => {
            let dist = Math.sqrt(Math.pow(poly.x - bullet.x, 2) + Math.pow(poly.y - bullet.y, 2))
            if (dist.toFixed(0) < (poly.size + bullet.size)) {
                poly.health -= bullet.damage
                bullet.health -= poly.damage
            }
        })
    })
    globalPolygons.forEach((poly) => {
        if (player) {
            let dx = player.x - poly.x
            let dy = player.y - poly.y
            let dx2 = dx*dx
            let dy2 = dy*dy
            let dist = Math.sqrt(dx2+dy2)
            if (dist.toFixed(0) < (poly.size + player.size)) {
                let angle = Math.atan2(poly.y - player.y, poly.x - player.x)
                poly.pushX += (4 * Math.cos(angle))/(poly.size/10)
                poly.pushY += (4 * Math.sin(angle))/(poly.size/10)
                
                player.velX -= (4 * Math.cos(angle))/(player.size/10)
                player.velY -= (4 * Math.sin(angle))/(player.size/10)

                player.health -= poly.damage
                poly.health -= player.bodyDamage
            }
        }
    })
},1000/30)
setInterval(() => {
    globalPolygons.forEach((pol) => {
        pol.radParts()
    })
}, 1000/30);

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
    particles.forEach((part) => {
        part.draw()
    })
    player.draw()
    player.faceMouse()
    requestAnimationFrame(render)
}
render()