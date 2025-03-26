import { darkenRGB, ctx, camera, mx, my, bullets, globalPolygons, shocks, abreviatedNumber, particles, getRadiantColor, mapSizeX  } from "./main.js"
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
        this.velX = 0.95 / Math.pow(1.6, (sides-3))
        this.velY = 0.95 / Math.pow(1.6, (sides-3))
        this.size = 10 * Math.pow(1.55, (sides-3))
        this.actualSides = sides
        this.sides = this.misshapen ? (sides == 3) ? 3 + 1 + Math.ceil(Math.random() * 10) : sides -1+(Math.ceil(Math.random()*6)) : sides;
        let index = Math.min(Math.max(sides - 3, 0), polygonColors.length - 1);
        this.color = polygonColors[index];
        this.radiantMode = 0
        this.damage = 2
        this.border = darkenRGB(this.color, 20);
        this.mean = null
        this.amplitude = null        
        this.maxSpeed = 0.125
        this.speed = 0.125*Math.pow(1.05 , rad)
        
        this.ranR = Math.ceil(Math.random()*255)
        this.ranG = Math.ceil(Math.random()*255)
        this.ranB = Math.ceil(Math.random()*255)
        this.randomColor = `rgb(${this.ranR}, ${this.ranG}, ${this.ranB})`
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
        let name = ((this.radiant>0) ? (((this.radiant>4) ? "Highly Radiant " + this.radiant : this.radiantnames[this.radiant-1]) + " ") : "") + (this.miscolored ? "Miscolored " : "") + (this.misshapen ? "Misshapen " : "") + ((this.actualSides-3 < 18) ? this.polygonalnames[this.actualSides-3] : this.sides + "-gon")
        ctx.font = "16px Arial"
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        ctx.textAlign = "center"
        ctx.globalAlpha = 0.1
        ctx.strokeText(name, this.x-camera.x, this.y-this.size-camera.y)
        ctx.fillText(name, this.x-camera.x, this.y-this.size-camera.y)
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
    constructor(x, y, velX, velY, host, damage) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.size = host.size/2
        this.host = host;
        this.health = 10e3
        this.despawnTick = 155
        this.damage = damage
        this.isBomb = true
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
export class Player {
    constructor(x, y, size, color, health, bodyDamage) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.border = darkenRGB(color, 15)
        this.health = health;
        this.velX = 0
        this.velY = 0
        this.xp = 0
        this.fov = 1
        this.holdMouse = false
        this.xpToNext = 100
        this.level = 1
        this.abilityMaxRadius = 90
        this.speed = 0.8 / (this.size/9)
        this.maxHealth = health;
        this.bodyDamage = bodyDamage;
        this.angle = 0;
        this.reloadTick = 0
        this.reloadMaxTick = 30
        this.keys = { }
    }
    reload() {
        if (this.reloadTick < this.reloadMaxTick) {
            this.reloadTick++
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
            this.size *= 1.01
            this.maxHealth *= 1.1
            this.health *= 1.1
            this.bodyDamage *= 1.1
        }
    }
    shoot() {
        if (this.reloadTick >= this.reloadMaxTick) {
            this.reloadTick = 0
            let bullet = new Bullet(this.x, this.y, 14*Math.cos(this.angle), 14*Math.sin(this.angle), this, this.bodyDamage)
            bullets.push(bullet)
        }
    }
    draw() {
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
        if (mx != null && my != null) {
            let dx = mx - this.x
            let dy = my - this.y
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

        this.x += this.velX;
        this.y += this.velY;
    }
}