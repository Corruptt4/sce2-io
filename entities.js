import { darkenRGB, ctx, camera, mx, my, bullets, globalPolygons, shocks, abreviatedNumber, particles, getRadiantColor, mapSizeX, player  } from "./main.js"
import {degToRads} from "./miscellaneous.js"

export function extractRGB(rgb) {
    if (typeof rgb !== "string") {
        console.error("Invalid input to darkenRGB:", rgb);
        return "rgb(0, 0, 0)";
    }

    
    let [r, g, b] = rgb.match(/\d+/g).map(Number)

    return {
        r: r, 
        g: g,
        b: b
    };
}

export class RadiantParticle {
    constructor(x, y, velX, velY, lifetime, host) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.lifetime = lifetime;
        this.host = host
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x-camera.x, this.y-camera.y, 5, 0, Math.PI*2)
        ctx.fillStyle = darkenRGB(getRadiantColor(this.host.time), -25)
        ctx.strokeStyle = darkenRGB(getRadiantColor(this.host.time), 15)
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.4
        ctx.fill()
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.closePath()
    }
    move() {
        this.x += this.velX;
        this.y += this.velY;
    }
    desp() {
        this.lifetime--
        if (this.lifetime <= 0)
            particles.splice(particles.indexOf(this), 1)
    }
}
export class RadiantStar {
    constructor(x, y, rotSpeed, points, ins, host, sizeAmp=1, isLustrous) {
        this.x = host.x;
        this.y = host.y;
        this.rotSpeed = rotSpeed;
        this.host = host;
        this.minSize = isLustrous ? (host.minStarSize*sizeAmp)  : (-host.maxStarSize*sizeAmp)
        this.size = host.starSize*sizeAmp
        this.points = points
        this.lustBehavior = isLustrous
        this.ins = ins
        this.ang2 = Math.PI / points
        this.maxSpeed = host.speed
        this.slowingDown = false
        this.rotationupd = 0
        this.ang = 0
        this.mean = null
        this.amplitude = null
        this.maxSize = host.maxStarSize*sizeAmp
        this.sizeAmp = sizeAmp
    }
    draw() {
        this.x = this.host.x
        this.y = this.host.y
        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x-camera.x, this.y-camera.y)
        ctx.rotate(this.ang)
        this.mean = (this.minSize+this.maxSize)/2
        this.amplitude = (this.maxSize-this.minSize)/2
        this.size = this.mean+this.amplitude*Math.sin(this.host.speed*this.host.time)
        ctx.moveTo(Math.cos(0)*this.size, Math.sin(0)*this.size)
        for (let i = 0; i < 2*this.points+1; i++) {
            let r = (i % 2 === 0) ? this.size : this.size * this.ins
            let angleX = Math.cos(i * this.ang2) * r;
            let angleY = Math.sin(i * this.ang2) * r;
            ctx.lineTo(angleX, angleY)
        }
        ctx.lineJoin = "round"
        ctx.fillStyle = getRadiantColor(this.host.time)
        ctx.strokeStyle = darkenRGB(getRadiantColor(this.host.time), 15)
        ctx.lineWidth = 3
        ctx.globalAlpha = 1
        ctx.fill()
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.closePath()
        ctx.restore()
    }
    upd() {
        if (this.lustBehavior) {
            this.rotationupd = 0.1 * Math.sin(this.host.speed * (this.host.time/20))
            this.ang += this.rotationupd
        } else {
            if (this.size < 0) {
                this.ang -= (this.host.speed / 10) * this.sizeAmp
            } else if (this.size > 0) {
                this.ang += (this.host.speed / 10) * this.sizeAmp
            }
        }
    }
}
export class Polygon {
    constructor(x, y, sides, polygonColors, rad) {
        this.x = x;
        this.angle = 0
        this.polygonalnames = [
            "Triangle", "Square", "Pentagon", "Hexagon", "Heptagon",
            "Octagon", "Nonagon", "Decagon", "Hendecagon", "Dodecagon",
            "Tridecagon", "Tetradecagon", "Pentadecagon", "Hexadecagon",
            "Heptadecagon", "Octadecagon", "Enneadecagon", "Icosagon"
        ]
        this.radiantnames = ["Radiant", "Gleaming", "Luminous", "Lustruous"]
        this.radiant = rad
        this.minAuraSize = (11.5*Math.pow(1.55, (sides-3)))
        this.maxAuraSize = (13*Math.pow(1.55, (sides-3)))*Math.pow(1.08, (rad))
        this.minStarSize = (12*Math.pow(1.55, (sides-3)))*Math.pow(1.08, (rad))
        this.maxStarSize = (13*Math.pow(1.55, (sides-3)))*Math.pow(1.08, (rad))
        this.starSize = (12*Math.pow(1.55, (sides-3)))
        this.auraSize = (12*Math.pow(1.55, (sides-3)))
        this.time = 0;
        this.health = 35 * Math.pow(3.6, sides)
        this.maxHealth = 35 * Math.pow(3.6, sides)
        this.xp = 2*(Math.pow(5,sides)) * (this.misshapen ? 3 : 1) * ((rad > 0) ? 25*Math.pow(4, rad-1) : 1) * (this.miscolored ? 3 : 1)
        this.misshapen = Math.random() < 1/65536
        this.miscolored = Math.random() < 1/65536
        this.y = y;
        this.luminousStar = new RadiantStar(x, y, 0.03, 6, 0.4, this, 0.8)
        this.lustrousStar = new RadiantStar(x, y, 0.06, 3, 0.1/(Math.pow(1.08, rad-4)), this, 1.5, true)
        this.pushX = 0
        this.pushY = 0
        this.collisionArray = []
        this.type = "polygon"
        this.velX = 0.95 / Math.pow(1.6, (sides-3))
        this.velY = 0.95 / Math.pow(1.6, (sides-3))
        this.size = 10 * Math.pow(1.55, (sides-3))
        this.actualSides = sides
        this.damaged = false
        this.dmgTick = 1
        this.sides = this.misshapen ? (sides == 3) ? 3 + 1 + Math.ceil(Math.random() * 10) : sides -1+(Math.ceil(Math.random()*6)) : sides;
        let index = Math.min(Math.max(sides - 3, 0), polygonColors.length - 1);
        this.actualColor = polygonColors[index]
        this.color = polygonColors[index];
        this.radiantMode = 0
        this.damage = 0.4 * Math.pow(1.01, sides-3)
        this.border = darkenRGB(this.color, 20);
        this.mean = null
        this.amplitude = null        
        this.name = ""
        this.maxSpeed = 0.125
        this.speed = 0.125*Math.pow(1.05 , rad)
        this.totalDamage = 0
        this.normDmgTick = 5
        
        this.ranR = Math.ceil(Math.random()*255)
        this.ranG = Math.ceil(Math.random()*255)
        this.ranB = Math.ceil(Math.random()*255)
        this.randomColor = `rgb(${this.ranR}, ${this.ranG}, ${this.ranB})`
    }
    colorBlend(percent) {
        let color
        if (this.radiant > 0) {
            color = extractRGB(getRadiantColor(this.time))
        } else {
            color = extractRGB(this.color)
        }
        let white = { r: 255, g: 255, b: 255 }
        let n = {
            r: Math.round((1 - percent) * color.r + percent*white.r),
            g: Math.round((1 - percent) * color.g + percent*white.g),
            b: Math.round((1 - percent) * color.b + percent*white.b)
        }

        return `rgb(${n.r}, ${n.g}, ${n.b})`
    }
    damageTaken(damage) {
        this.totalDamage += damage
    }
    borderCheck() {
        if (this.x > mapSizeX) {
            this.pushX -= 2
        }
        if (this.x < 0-mapSizeX/2) {
            this.pushX += 2
        }
        if (this.y > mapSizeX) {
            this.pushY -= 2
        }
        if (this.y < 0-mapSizeX/2) {
            this.pushY += 2
        }
    }
    radParts() {
        if (this.radiant>0) {
            let part = new RadiantParticle(this.x-this.size+Math.random()*(this.size*2), this.y-this.size+Math.random()*(this.size*2), 0.3*Math.cos(Math.random()*(Math.PI*2)),0.3*Math.sin(Math.random()*(Math.PI*2)), 40, this)
            particles.push(part)
        }
    }
    radiantB() {
        if (this.radiant > 0) {
            ctx.fillStyle = getRadiantColor(this.time)
            ctx.strokeStyle = darkenRGB(getRadiantColor(this.time), 15)
        }
    }
    draw() {
        if (this.hp < 0) {
            this.hp = 0
        }
        if (this.radiant >= 2) {
            this.mean = (this.minAuraSize+this.maxAuraSize)/2
            this.amplitude = (this.maxAuraSize-this.minAuraSize)/2
            this.auraSize = this.mean+this.amplitude*Math.sin(this.speed*this.time)
            ctx.save()
            ctx.beginPath()
            ctx.translate(this.x-camera.x, this.y-camera.y)
            ctx.rotate(this.angle)
            ctx.lineJoin = "round"
            ctx.moveTo(this.auraSize * Math.cos(0), this.auraSize * Math.sin(0))
            for (let i = 0; i < this.sides+1.2; i++) {
                ctx.lineTo(
                    this.auraSize * Math.cos((i * 2 * Math.PI) / this.sides),
                    this.auraSize * Math.sin((i * 2 * Math.PI) / this.sides),
                );
            }
            ctx.fillStyle = darkenRGB(getRadiantColor(this.time), -25)
            ctx.strokeStyle = darkenRGB(getRadiantColor(this.time), -10)
            ctx.lineWidth = 3
            ctx.globalAlpha = 0.8
            ctx.fill()
            ctx.stroke()
            ctx.globalAlpha = 1
            ctx.restore()
        }

        if (this.radiant >= 3) {
            this.luminousStar.draw()
        }
        if (this.radiant >= 4) {
            this.lustrousStar.draw()
        }
        
        ctx.beginPath()
        this.name = ((this.radiant>0) ? (((this.radiant>4) ? "Highly Radiant " + this.radiant : this.radiantnames[this.radiant-1]) + " ") : "") + (this.miscolored ? "Miscolored " : "") + (this.misshapen ? "Misshapen " : "") + ((this.actualSides-3 < 18) ? this.polygonalnames[this.actualSides-3] : this.sides + "-gon")
        
        ctx.font = "16px Arial"
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        ctx.textAlign = "center"
        ctx.globalAlpha = 0.1
        ctx.strokeText(this.name, this.x-camera.x, this.y-this.size-camera.y)
        ctx.fillText(this.name, this.x-camera.x, this.y-this.size-camera.y)
        ctx.globalAlpha = 1
        ctx.closePath()


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
        ctx.fillStyle = this.miscolored ? this.randomColor : this.color
        ctx.lineWidth = 3
        ctx.strokeStyle = this.miscolored ? darkenRGB(this.randomColor, 15) : this.border
        this.radiantB()
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
        
        if ((this.health/this.maxHealth) < 1) {
            ctx.beginPath()
            ctx.fillStyle = this.miscolored ? darkenRGB(this.randomColor, 15) : darkenRGB(this.color, 15);
            ctx.lineWidth = 6
            ctx.strokeStyle = this.miscolored ? darkenRGB(this.randomColor, 15) : darkenRGB(this.color, 15);
            this.radiantB()
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, this.size*2, 3, 3)
            ctx.fill()
            ctx.stroke()        
            ctx.closePath()

            ctx.beginPath()
            ctx.fillStyle = this.miscolored ? this.randomColor : this.color
            this.radiantB()
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, (this.size*2)*(this.health / this.maxHealth), 3,3)
            ctx.fill()
            ctx.closePath()
        }
    }
    move() {
        if (!this.damaged) {
            this.dmgTick--
        }
        if (this.dmgTick <= 0 && !this.damaged) {
            this.dmgTick = 7
            this.damaged = true
            this.color = this.actualColor
            this.border = darkenRGB(this.color, 20);
        }
        if (this.damaged) {
            this.normDmgTick--
            let perc = this.totalDamage/this.maxHealth
            this.color = this.colorBlend(perc)
            this.border = darkenRGB(this.color, 15)
            if (this.normDmgTick <= 0) {
                this.normDmgTick = 5
                this.totalDamage = 0
                this.damaged = false
                this.color = this.actualColor
                this.border = darkenRGB(this.color, 15)
            }
        }
        this.angle += 0.05/this.size

        this.x += this.pushX
        this.y += this.pushY

        this.x += this.velX*Math.cos(this.angle)
        this.y += this.velY*Math.sin(this.angle)
    }
}

export class Shock {
    constructor(x, y, size, maxSize) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxSize = maxSize;
        this.alpha = 1
    }
    draw() {
        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.strokeStyle = `rgba(255, 0, 0, ${this.alpha})`
        ctx.arc(this.x-camera.x, this.y-camera.y, this.size, 0, Math.PI*2)
        ctx.stroke()
        ctx.closePath()
    }
    upd() {
        if (this.alpha > 0) {
            this.alpha -= 0.05
        }
        if (this.alpha <= 0) {
            shocks.splice(shocks.indexOf(this), 1)
        }
        this.size += (this.maxSize-this.size)*0.04
    }
}
export class Bullet {
    constructor(x, y, velX, velY, host, damage, size, health) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.size = size
        this.host = host;
        this.type = "bullet"
        this.health = health
        this.despawnTick = 155
        this.damage = damage
        this.isBomb = false
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.host.color
        ctx.strokeStyle = this.host.border
        ctx.lineWidth = 3
        ctx.arc(this.x-camera.x, this.y-camera.y, this.size, 0, Math.PI*2)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }
    explode() {
        let maxSize = this.size*50
        let shock = new Shock(this.x, this.y, 0, maxSize)
        globalPolygons.forEach((pol) => {
            let dist = Math.sqrt(Math.pow(pol.x - this.x, 2) + Math.pow(pol.y - this.y, 2))
            if (dist < maxSize) {
                pol.health -= this.damage*3
            }
        })
        shocks.push(shock)
    }
    desp() {
        this.despawnTick--
        if (this.despawnTick <= 0) {
            if (this.isBomb) {
                this.explode()
            }
            bullets.splice(bullets.indexOf(this), 1)
        }
    }
    move() {
        this.x += this.velX,
        this.y += this.velY
    }
}
export class Barrel {
    constructor(x, y, width, height, host, stats = {
        reload: 30,
        damage: 15,
        bulletHealth: 100,
        offsetX: 0,
        offsetY: 0,
        bulletSpeed: 1,
        angleOffset: 0,
        delay: 0
    }) {
        this.x = x
        this.y = y
        this.width = width;
        this.height = height;
        this.reloadTick = 0
        this.reloadMaxTick = stats.reload
        this.host = host;
        this.angleOffset = stats.angleOffset || 0
        this.bulletSpeed = stats.bulletSpeed || 1
        this.delay = stats.delay || 0
        this.stats = stats;
        this.canAnimate = false;
        this.shootHeight = width/2
        this.reversingReload = false;
        this.shootHeight2 = width
        this.offsetX = stats.offsetX || 0
        this.offsetY = stats.offsetY || 0
        this.angle = host.angle+degToRads(this.angleOffset)
        this.color = "rgb(135,135,135)"
    }
    reload() {
        if (this.reloadTick < (this.reloadMaxTick+this.reloadMaxTick*this.delay)) {
            this.reloadTick++
        }
    }
    getGunTip() {
        let gunX = this.x + this.host.x
        let gunY = this.y + this.host.y;
    
        let tipX = gunX + (this.width + this.offsetX) * (this.host.size / 10) * Math.cos(this.angle)
                         - this.offsetY * (this.host.size / 10) * Math.sin(this.angle);
                         
        let tipY = gunY + (this.width + this.offsetX) * (this.host.size / 10) * Math.sin(this.angle)
                         + this.offsetY * (this.host.size / 10) * Math.cos(this.angle);
    
        return { x: tipX, y: tipY };
    }
    
    shoot() {
        let s = this.getGunTip()
        if (this.reloadTick >= (this.reloadMaxTick+this.reloadMaxTick*this.delay)) {
            this.canAnimate = true
            this.reloadTick = 0
            let bullet = new Bullet(s.x, s.y, 5*this.bulletSpeed*Math.cos(this.angle), 5*this.bulletSpeed*Math.sin(this.angle), this.host, (this.stats.damage * (1.03**this.host.level)), this.height*(this.host.size/10)/2, (this.stats.bulletHealth * (1.03**this.host.level)))
            bullets.push(bullet)
        }
    }
    draw() {
        this.angle = this.host.angle + degToRads(this.angleOffset)
        ctx.save()
        ctx.beginPath()
        let gunX = this.host.x - camera.x
        let gunY = this.host.y  - camera.y
        ctx.translate(gunX, gunY)
        ctx.rotate(this.angle)
        ctx.fillStyle = this.color
        ctx.strokeStyle = darkenRGB(this.color, 15)
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        ctx.roundRect(
            this.offsetX*(this.host.size/10), 
            (-this.height/2+this.offsetY)*(this.host.size/10),
             this.width * (this.host.size/10), 
             this.height * (this.host.size/10), 0
            )
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }
    animateGun() {
        if (this.canAnimate) {
            if (this.width > this.shootHeight) {
                this.width -= this.shootHeight/6
            }
            if (this.width < this.shootHeight && !this.reversingReload) {
                this.width = this.shootHeight
            }
            if (this.width == this.shootHeight) {
                this.reversingReload = true;
            }
            if (this.reversingReload && this.width < this.shootHeight2) {
                this.width += this.shootHeight2/6
            }
            if (this.width >= this.shootHeight2 && this.reversingReload) {
                this.width = this.shootHeight2
                this.reversingReload = false
                this.canAnimate = false
            }
        }
    }
}
export class Player {
    constructor(x, y, size, color, health, bodyDamage) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.mx = null
        this.my = null
        this.collisionArray = []
        this.border = darkenRGB(color, 15)
        this.health = health;
        this.velX = 0
        this.velY = 0
        this.xp = 0
        this.team = 1
        this.holdMouse = false
        this.autoFire = false
        this.xpToNext = 100
        this.level = 1
        this.type = "player"
        this.abilityMaxRadius = 90
        this.speed = 0.8 / (this.size/9)
        this.maxHealth = health;
        this.bodyDamage = bodyDamage;
        this.angle = 0;
        this.keys = { }
        this.guns = [
            new Barrel(0, 0, 20, 8, this, {
                reload: 15,
                damage: 5,
                offsetX: 0,
                offsetY: -5,
                bulletSpeed: 1.5,
                bulletHealth: 15,
                angleOffset: 0
            }),
            new Barrel(0, 0, 20, 8, this, {
                reload: 15,
                damage: 5,
                offsetX: 0,
                offsetY: 5,
                bulletSpeed: 1.5,
                bulletHealth: 15,
                angleOffset: 0,
                delay: 0.5
            })
        ]
    }
    
    borderCheck() {
        if (this.x > mapSizeX) {
            this.velX -= 2
        }
        if (this.x < 0-mapSizeX/2) {
            this.velX += 2
        }
        if (this.y > mapSizeX) {
            this.velY -= 2
        }
        if (this.y < 0-mapSizeX/2) {
            this.velY += 2
        }
    }
    levelUpCheck() {
        if (this.xp >= this.xpToNext) {
            this.level++
            this.xp -= this.xpToNext
            this.xpToNext *= 1.2
            this.size *= 1.005
            this.maxHealth *= 1.1
            this.health *= 1.1
            this.bodyDamage *= 1.1
        }
    }
    draw() {
        this.guns.forEach((g) => {g.draw()})
        ctx.save()
        ctx.beginPath();
        ctx.translate(this.x-camera.x,this.y-camera.y)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.border;
        ctx.rotate(this.angle)
        ctx.arc(0, 0, this.size, 0, Math.PI * 2, 0)
        ctx.fill()
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x-camera.x, this.y-camera.y)
        ctx.font = "15px Arial"
        ctx.textAlign = "center"
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.border;
        ctx.fillText(abreviatedNumber(this.xp) + "/" + abreviatedNumber(this.xpToNext), 0, -this.size-10, 200)
        ctx.fillText("Lv." + abreviatedNumber(this.level), 0, -this.size-25, 200)
        ctx.closePath()
        ctx.restore()

        if ((this.health/this.maxHealth) < 1) {
            ctx.beginPath()
            ctx.fillStyle = darkenRGB(this.color, 15);
            ctx.lineWidth = 6
            ctx.strokeStyle = darkenRGB(this.color, 15)
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, this.size*2, 3, 3)
            ctx.fill()
            ctx.stroke()        
            ctx.closePath()

            ctx.beginPath()
            ctx.fillStyle = this.color
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, (this.size*2)*(this.health / this.maxHealth), 3,3)
            ctx.fill()
            ctx.closePath()
        }
    }
    faceMouse() {
        if (this.mx != null && this.my != null) {
            let dx = this.mx-this.x
            let dy = this.my-this.y
            let angle = Math.atan2(dy, dx)
            this.angle = angle
        }
    }
    move() {

        /** KEY CODES
         * w -- 87
         * a -- 65
         * s -- 83
         * d -- 68
         * 
         * arrowUp -- 38
         * arrowDown -- 40
         * arrowLeft -- 37
         * arrowRight -- 39
         */

        if (this.keys[87] && !this.keys[38]) {
            this.velY -= this.speed
        }
        if (this.keys[83] && !this.keys[40]) {
            this.velY += this.speed
        }
        if (this.keys[65] && !this.keys[37]) {
            this.velX -= this.speed
        }
        if (this.keys[68] && !this.keys[39]) {
            this.velX += this.speed
        }
        
        if (this.keys[38] && !this.keys[87]) {
            this.velY -= this.speed
        }
        if (this.keys[40] && !this.keys[83]) {
            this.velY += this.speed
        }
        if (this.keys[37] && !this.keys[65]) {
            this.velX -= this.speed
        }
        if (this.keys[39] && !this.keys[68]) {
            this.velX += this.speed
        }

        if (this.keys[69]) {
            this.autoFire = !this.autoFire
        }

        this.x += this.velX;
        this.y += this.velY;
        this.mx += this.velX
        this.my += this.velY
    }
}
export class Bot {
    constructor(x, y, size, color, health, bodyDamage, team) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = ["rgb(0,0,255)", "rgb(255,0,0)", "rgb(0,255,0)", "rgb(255,0,125)"][team-1];
        this.border = darkenRGB(this.color, 15)
        this.mx = null
        this.my = null
        this.followTeammatePlayer = false
        this.collisionArray = []
        this.health = health;
        this.velX = 0
        this.velY = 0
        this.xp = 0
        this.entities = [];
        this.target = null
        this.team = team
        this.holdMouse = false
        this.xpToNext = 100
        this.level = 1
        this.type = "bot"
        this.abilityMaxRadius = 90
        this.speed = 0.8 / (this.size/9)
        this.range = size*20
        this.maxHealth = health;
        this.bodyDamage = bodyDamage;
        this.angle = 0;
        this.diet = []
        this.angleChangeTick = 90
        this.keys = { }
        this.guns = []
        for (let i = 0; i < 1; i++) {
            this.guns.push(
                new Barrel(0, 0, 18, 8, this, {
                    damage: 5,
                    bulletHealth: 15,
                    offsetX: 0,
                    offsetY: 0,
                    reload: 15,
                    bulletSpeed: 1.5,
                    angleOffset: (360/3)*i,
                    delay: 0
                })
            )
        }
    }
    
    borderCheck() {
        if (this.x > mapSizeX) {
            this.velX -= 2
        }
        if (this.x < 0-mapSizeX/2) {
            this.velX += 2
        }
        if (this.y > mapSizeX) {
            this.velY -= 2
        }
        if (this.y < 0-mapSizeX/2) {
            this.velY += 2
        }
    }
    levelUpCheck() {
        if (this.xp >= this.xpToNext) {
            this.level++
            this.xp -= this.xpToNext
            this.xpToNext *= 1.2
            this.size *= 1.005
            this.maxHealth *= 1.1
            this.health *= 1.1
            this.bodyDamage *= 1.1
            this.range = this.size*20
        }
    }
    draw() {
        this.guns.forEach((g) => {g.draw()})
        ctx.save()
        ctx.beginPath();
        ctx.translate(this.x-camera.x,this.y-camera.y)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.border;
        ctx.rotate(this.angle)
        ctx.arc(0, 0, this.size, 0, Math.PI * 2, 0)
        ctx.fill()
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x-camera.x, this.y-camera.y)
        ctx.font = "15px Arial"
        ctx.textAlign = "center"
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.border;
        ctx.fillText(abreviatedNumber(this.xp) + "/" + abreviatedNumber(this.xpToNext), 0, -this.size-10, 200)
        ctx.fillText("Lv." + abreviatedNumber(this.level), 0, -this.size-25, 200)
        ctx.closePath()
        ctx.restore()

        if ((this.health/this.maxHealth) < 1) {
            ctx.beginPath()
            ctx.fillStyle = darkenRGB(this.color, 15);
            ctx.lineWidth = 6
            ctx.strokeStyle = darkenRGB(this.color, 15)
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, this.size*2, 3, 3)
            ctx.fill()
            ctx.stroke()        
            ctx.closePath()

            ctx.beginPath()
            ctx.fillStyle = this.color
            ctx.roundRect(this.x - this.size - camera.x, this.y + this.size+7 - camera.y, (this.size*2)*(this.health / this.maxHealth), 3,3)
            ctx.fill()
            ctx.closePath()
        }
    }
    faceMouse() {
        if (this.mx != null && this.my != null) {
            let dx = this.mx-this.x
            let dy = this.my-this.y
            let angle = Math.atan2(dy, dx)
            this.angle = angle
        }
    }
    move() {
        let possibleTargets = []
        let possiblePolys = []
        if (!this.target && this.entities.length > 0) {
            this.entities.forEach((e) => {
                let dx = e.x - this.x
                let dy = e.y - this.y
                let dist = dx*dx+dy*dy
                if (dist < Math.pow((this.range+e.size), 2)) {
                    possibleTargets.push(e)
                }
            })
        }
        if (this.target == null) {
            this.diet.forEach((poly) => {
                let dx = poly.x - this.x
                let dy = poly.y - this.y
                let dist = dx*dx+dy*dy
                if (dist < Math.pow(this.range+poly.size, 2)) {
                    possiblePolys.push(poly)
                }
            })
        }
        if (this.target == null) {
            possiblePolys.sort((a, b) => b.xp - a.xp)
            this.target = possiblePolys[0]
        }

        if (possibleTargets && this.target == null) {
            possibleTargets.forEach((p) => {
                if (p.type === "player" || p.type === "bot" && p !== this) {
                    if (p.team != this.team) {
                        this.target = p
                    }
                }
            })
        }
        if (this.target == null) {
            this.angleChangeTick--
            if (this.angleChangeTick <= 0 && !this.followTeammatePlayer) {
                this.angleChangeTick = 90
                this.angle = Math.random() * (Math.PI * 2)
                
            }
        }

        if (this.target) {
            let dx = this.target.x - this.x
            let dy = this.target.y - this.y
            let dist = dx*dx + dy*dy
            let r = this.followTeammatePlayer ? (this.size*9) + player.size : (this.size*8 + this.target.size*15)
            this.angle = Math.atan2(dy, dx)
            let pangle
            if (this.followTeammatePlayer && player.team == this.team) {
                let pdx = player.x - this.x
                let pdy = player.y - this.y
                pangle = -Math.atan2(pdx, pdy)
            }
            if (dist <= r*r) {
                this.velX += this.speed * Math.cos((this.followTeammatePlayer ? pangle : this.angle ))
                this.velY += this.speed * Math.sin((this.followTeammatePlayer ? pangle : this.angle ))
            }
            if (this.target.health <= 0 || dist >= (r*(3*r))) {
                this.target = null
            }
        }
        
        if (this.followTeammatePlayer && this.team == player.team) {
            let dx = player.x - this.x
            let dy = player.y - this.y
            let angle = Math.atan2(dy, dx)
            this.velX += Math.cos(angle) * this.speed
            this.velY += Math.sin(angle) * this.speed
        } else if (!this.target && !this.followTeammatePlayer) {
            this.velX += Math.cos(this.angle) * this.speed
            this.velY += Math.sin(this.angle) * this.speed
        }
        this.x += this.velX
        this.y += this.velY
    }
}

export class TeamZone {
    constructor(x, y, w, team, color) {
        this.x = x
        this.y = y
        this.l = w
        this.team = team;
        this.color = color;
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.globalAlpha = 0.6
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.l, this.l)
        ctx.closePath()
    }
}