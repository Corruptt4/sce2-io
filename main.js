export const canvas = document.getElementById("c")
        ,   ctx = canvas.getContext("2d")

export let globalPolygons = []
        ,   globalBots = []

export let player = null
,     mx = null
,     my = null
,     frictionFactor = 0.93
,     shocks = []
,     bullets = []
,     particles = []
,     mapSizeX = 8000
,     mapSizeY = mapSizeX
,     miniWidth = 350
,     miniHeight = 350
,     killNotifs = []

export let globalStuff = globalPolygons.concat(bullets.concat(player).concat(globalBots))


import { updateCamera } from "./miscellaneous.js"
import { Spawner } from "./spawner.js"
import { Polygon, Player, Bot, TeamZone } from "./entities.js"
import { QuadTree, Rect } from "./collisions/quadTree.js"
import { KillNotif, Minimap, Leaderboard } from "./otherClasses.js"
let boundary = new Rect(-mapSizeX/2, -mapSizeX/2, mapSizeX*1.5, mapSizeX*1.5)
let qt = new QuadTree(boundary, 16)
let leaderboard = new Leaderboard(canvas.width*2, 0, 10, globalBots.concat(player))
export var camera = {
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
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var globalBotCount = 90
var botCount = 0

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
export var teamColors = [
    "rgb(0, 0, 255)",
    "rgb(255, 0, 0)",
    "rgb(0, 255, 0)",
    "rgb(155, 0, 255)"
]
export var teamZones = [
    new TeamZone(-mapSizeX/2, -mapSizeX/2, 600, 1, teamColors[0]),
    new TeamZone(mapSizeX-600, -mapSizeX/2, 600, 1, teamColors[1]),
    new TeamZone(-mapSizeX/2, mapSizeX-600, 600, 1, teamColors[2]),
    new TeamZone(mapSizeX-600, mapSizeX-600, 600, 1, teamColors[3])
]
let randomTeam = Math.floor(Math.random()*teamColors.length)
// polygonColors[((this.level) > polygonColors.length ? (polygonColors.length-1) : (this.level))]
let chosenZone = teamZones[randomTeam]
player = new Player(
    chosenZone.x + Math.random()*chosenZone.l,  
    chosenZone.y + Math.random()*chosenZone.l, 
    20, 
    teamColors[randomTeam], 
    800, 
    5
)
player.team = randomTeam+1
window.addEventListener("resize", (e) => {
    camera.width = window.innerWidth
    camera.height = window.innerHeight
})
window.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect()
    mx = e.clientX - rect.left + camera.x
    my = e.clientY - rect.top + camera.y
    player.mx = mx
    player.my = my
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
let maxPolys = 400
let spawners = []
for (let i = 0, n = 2; i < n; i++) {
    spawners.push(new Spawner(0, maxPolys/n, 11, Polygon, globalPolygons, mapSizeX, mapSizeY, polygonColors, 1, 15, qt))
}
function spawnBot(lim) {
    for (let i = 0; i < lim; i++) {
        botCount++
        let team = 1+Math.floor(Math.random()*4)
        let teamZone = teamZones[team-1]
        let bot = new Bot(
            teamZone.x + Math.random()*teamZone.l,  
            teamZone.y + Math.random()*teamZone.l, 
            20, 
            teamZone.color, 
            800, 
            5, 
            team
        )
        bot.diet = globalPolygons
        bot.entities = globalStuff
        globalBots.push(bot)
        globalStuff.push(bot)
        qt.insert(bot)
    }
}
setInterval(()=>{
    spawners.forEach((s) => {
        s.spawnLoop()
    })
},100)
setInterval(() => {
    if (botCount <= globalBotCount) {
        spawnBot(1)
    }
}, 200)
setInterval(() => {
    globalBots.forEach((b) => {
        if (b.health <= 0) {
            botCount--
            b.collisionArray.forEach((ins) => {
                if (ins) {
                    if (ins.type == "bullet") {
                        ins.host.xp += b.xp / b.collisionArray.length
                        ins.host.totalXP += b.totalXP / b.collisionArray.length
                    }
                    if (ins.type == "bot") {
                        ins.xp += b.xp / b.collisionArray.length
                        ins.totalXP += b.totalXP / b.collisionArray.length
                    }
                    if (ins.type == "player") {
                        ins.xp += b.xp / b.collisionArray.length
                        ins.totalXP += b.totalXP / b.collisionArray.length
                    }
                    if (ins.type == "polygon") {
                        ins.xp += b.xp / b.collisionArray.length
                    }
                }
            })
            globalBots.splice(globalBots.indexOf(b), 1)
        }
    })
    globalPolygons.forEach((poly) => {
        poly.move()
        poly.pushX *= frictionFactor
        poly.pushY *= frictionFactor
        if (poly.health <= 0) {
            poly.collisionArray.forEach((ins) => {
                if (ins) {
                    if (ins.type === "bullet") {
                        ins.host.xp += poly.xp / poly.collisionArray.length
                        ins.host.totalXP += poly.xp / poly.collisionArray.length
                    } else {
                        ins.xp += poly.xp / poly.collisionArray.length
                        ins.totalXP += poly.xp / poly.collisionArray.length
                    }
                }
            })
            killNotifs.push(new KillNotif(0, 10+mini.sideLength*1.5, "rgb(255, 0, 0)", poly.name + " died."))
            globalPolygons.splice(globalPolygons.indexOf(poly), 1)
            spawners[Math.floor(Math.random()*spawners.length)].currentPolys--
        }
        if (poly.radiant > 0) {
            poly.time += 0.05
        }
        if (poly.radiant >= 3) {
            poly.luminousStar.upd()
        }
        if (poly.radiant >= 4) {
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
    
    globalStuff.forEach((b) => {
        if (b.type == "bot") {
            b.move()
            b.guns.forEach((g) => {
                    if (b.target) {
                        g.reload()
                        g.shoot()
                        b.levelUpCheck()
                    }
                    g.animateGun()
            })
            b.borderCheck()
            b.velX *= frictionFactor
            b.velY *= frictionFactor
        }
    })
    player.move()
    player.levelUpCheck()
    player.guns.forEach((g) => {
        g.reload()
        g.animateGun()
        if (player.holdMouse || player.autoFire) {
            g.shoot()
        }
    })
    
    killNotifs.forEach((notif) => {
        notif.move()
    })
    player.velX *= frictionFactor
    player.velY *= frictionFactor
},1000/60)
setInterval(() => {
    
   globalBots.forEach((b) => {
        b.entities = globalStuff
        b.diet = globalPolygons
   })
    qt.reset()
    globalStuff.forEach((p)=> {
        qt.insert(p)
    })
    globalStuff.forEach((p) => {
        let ind = qt.points.indexOf(p)
        if (ind > -1) {
            qt.points.splice(ind, 1)
        }
        qt.insert(p)
    })
    qt.groupCollisionCheck()
    globalPolygons.forEach((p)=> {
        p.borderCheck()
    })
    if (qt.collisions.length > 0) {
        qt.collisions.forEach((col) => {
            col.forEach((memb) => {
                for (let i = 0; i < col.length; i++) {
                    let memb2 = col[i]
                    if (memb != memb2) {
                        if (memb.type === memb2.type) {
                                let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                                memb2.pushX += (0.1 * Math.cos(angle))/(memb2.size/10)
                                memb2.pushY += (0.1 * Math.sin(angle))/(memb2.size/10)
                                memb.pushX -= (0.1 * Math.cos(angle))/(memb.size/10)
                                memb.pushY -= (0.1 * Math.sin(angle))/(memb.size/10)
                        }
                       
                        if ((memb.type == "player" || memb.type == "bot") && memb2.type == "polygon") {
                                let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                                memb2.pushX += (0.1 * Math.cos(angle))/(memb2.size/10)
                                memb2.pushY += (0.1 * Math.sin(angle))/(memb2.size/10)
                                memb.velX -= (0.1 * Math.cos(angle))/(memb.size/10)
                                memb.velY -= (0.1 * Math.sin(angle))/(memb.size/10)
                                memb2.damageTaken(memb.bodyDamage)
                                memb.health -= memb2.damage
                                memb2.health -= memb.bodyDamage
                                memb2.collisionArray.push(memb)
                                memb.collisionArray.push(memb2)
                        }
                        if (memb.type == "bullet" && memb2.type == "polygon") {
                            let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                                memb.velX -= (0.05 * Math.cos(angle))/(memb.size/10)
                                memb.velY -= (0.05 * Math.sin(angle))/(memb.size/10)
                                memb2.damageTaken(memb.damage)
                                memb.health -= memb2.damage
                                memb2.health -= memb.damage
                                memb2.collisionArray.push(memb)
                        }
                    }
                }
            })
        })
        qt.collisions.forEach((col) => {
            col.forEach((memb) => {
                for (let i = 0; i < col.length; i++) {
                    let memb2 = col[i]
                    if (memb != memb2) {
                        if (memb.type == "bullet" && memb2.type == "bot") {
                            let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                            if (memb.host.team != memb2.team) {
                                memb.velX -= (0.1 * Math.cos(angle))/(memb.size/10)
                                memb.velY -= (0.1 * Math.sin(angle))/(memb.size/10)
                                memb.health -= memb2.bodyDamage
                                memb2.health -= memb.damage
                                memb2.collisionArray.push(memb)
                            }
                        }
                        if (memb.type == "bullet" && memb2.type == "player") {
                            let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                            if (memb.host.team != memb2.team) {
                                memb.velX -= (0.1 * Math.cos(angle))/(memb.size/10)
                                memb.velY -= (0.1 * Math.sin(angle))/(memb.size/10)
                                memb.health -= memb2.bodyDamage
                                memb2.health -= memb.damage
                                memb2.collisionArray.push(memb)
                            }
                        }
                        if (memb.type == "bot" && memb2.type == "bot") {
                            let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                            memb2.velX += (0.1 * Math.cos(angle))/(memb2.size/10)
                            memb2.velY += (0.1 * Math.sin(angle))/(memb2.size/10)
                            memb.velX -= (0.1 * Math.cos(angle))/(memb.size/10)
                            memb.velY -= (0.1 * Math.sin(angle))/(memb.size/10)
                            if (memb.team != memb2.team) {
                                memb.health -= memb2.bodyDamage
                                memb2.health -= memb.bodyDamage
                                memb.collisionArray.push(memb2)
                                memb2.collisionArray.push(memb)
                            }
                    }
                    if (memb.type == "bot" && memb2.type == "player") {
                            let angle = Math.atan2(memb2.y - memb.y, memb2.x - memb.x)
                            memb2.velX += (0.1 * Math.cos(angle))/(memb2.size/10)
                            memb2.velY += (0.1 * Math.sin(angle))/(memb2.size/10)
                            memb.velX -= (0.1 * Math.cos(angle))/(memb.size/10)
                            memb.velY -= (0.1 * Math.sin(angle))/(memb.size/10)
                            if (memb.team != memb2.team) {
                                memb.health -= memb2.bodyDamage
                                memb2.health -= memb.bodyDamage
                                memb.collisionArray.push(memb2)
                                memb2.collisionArray.push(memb)
                            }
                    }
                    }
                }
            })
        })
    }
    player.borderCheck()
    leaderboard.update()
},1000/60)
// setInterval(() => {
//     globalPolygons.forEach((pol) => {
//         pol.radParts()
//     })
// }, 1000/15);

function makeGrid(cellSize, camera) {
    ctx.beginPath();

    for (let x = -mapSizeX*2; x <= mapSizeX*4; x += cellSize) {
        ctx.moveTo(x - camera.x, -mapSizeY*2-camera.y);
        ctx.lineTo(x - camera.x, mapSizeY*2 - camera.y);
    }

    for (let y = -mapSizeY*2; y <= mapSizeY*4; y += cellSize) {
        ctx.moveTo(-mapSizeX*2-camera.x, y - camera.y);
        ctx.lineTo(mapSizeX*2 - camera.x, y - camera.y);
    }

    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    // bounds
    ctx.beginPath()
    ctx.fillStyle = "rgba(185, 185, 185, 0.3)"
    ctx.fillRect(-mapSizeX*1.5-camera.x,-mapSizeY/2-camera.y, mapSizeX*3.5, -mapSizeY)
    ctx.fillRect(-mapSizeX/2-camera.x,-mapSizeY/2-camera.y, -mapSizeX, mapSizeY*2.5)
    ctx.fillRect(-mapSizeX/2-camera.x,mapSizeY-camera.y, mapSizeX*2.5, mapSizeY)
    ctx.fillRect(mapSizeX-camera.x,-mapSizeY/2-camera.y, mapSizeX, mapSizeY+mapSizeY/2)
    ctx.closePath()
}

qt.insert(player)
let mini = new Minimap(canvas.width, canvas.height, 125, mapSizeX)
mini.zones.push(teamZones)
function render() {
    globalBots.concat(player).forEach((p) => {
        if (!leaderboard.tanks.includes(p)) {
            leaderboard.tanks.push(p)
        }
    })
    globalStuff = globalPolygons.concat(bullets.concat(player)).concat(globalBots)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateCamera(player)
    makeGrid(20, camera)
    
    teamZones.forEach((z) => {
        z.draw()
    })
    globalStuff.forEach((b) => {
        b.canDraw = true
        if (b.canDraw) {
            b.draw()
        }
    })
    // globalStuff.forEach((p) => {
    //     if (p.x < 0-camera.width/2) {
    //         p.canDraw = false
    //     } else {
    //         p.canDraw = true
    //     }
    //     if (p.y > camera.width+camera.width/2) {
    //         p.canDraw = false
    //     } else {
    //         p.canDraw = true
    //     }
        
    //     if (p.x > camera.width+camera.width/2) {
    //         p.canDraw = false
    //     } else {
    //         p.canDraw = true
    //     }
    //     if (p.y < 0-camera.height/2) {
    //         p.canDraw = false
    //     } else {
    //         p.canDraw = true
    //     }
    // })
    player.faceMouse()
    player.upgradeButtons.forEach((upg) => {
        if (player.level >= upg.levelRequirement && player.tier == upg.tier) {
            upg.draw()
        }
    })
    
    
    mini.x = 10
    mini.y = 10
    mini.entities = globalStuff
    mini.zones = teamZones
    mini.draw()
    leaderboard.x = window.innerWidth/1.13
    leaderboard.draw()
    // qt.draw(ctx, camera)
    killNotifs.forEach((notif) => {
        notif.draw()
    })
    requestAnimationFrame(render)
}
render()