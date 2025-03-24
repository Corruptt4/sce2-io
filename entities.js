import { darkenRGB, ctx, camera, mx, my, bullets, globalPolygons, shocks, abreviatedNumber } from "./main.js"

export class Polygon {
    constructor(x, y, sides, polygonColors) {
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
        this.damage = 2
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
        this.holdMouse = false
        this.xpToNext = 100
        this.level = 1
        this.abilityMaxRadius = 90
        this.speed = 0.8 / (this.size/10)
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
    levelUpCheck() {
        if (this.xp >= this.xpToNext) {
            this.level++
            this.xp -= this.xpToNext
            this.xpToNext *= 1.2
            this.size *= 1.01
            this.maxHealth *= 1.31
            this.health *= 1.31
            this.bodyDamage *= 1.31
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