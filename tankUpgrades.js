// TODO: CONNECT A TANK CLASS THAT SUPPORTS UPGRADES
// [Weapon]-[Body]

import { ctx, canvas, darkenRGB } from "./main.js"
import { player } from "./main.js"
import { degToRads } from "./miscellaneous.js";

export class BarrelForImage {
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
        this.x = 0
        this.y = 0
        this.width = width;
        this.height = height;
        this.reloadTick = 0
        this.delayReloadTick = 0
        this.reloadMaxTick = stats.reload
        this.host = host;
        this.angleOffset = stats.angleOffset || 0
        this.bulletSpeed = stats.bulletSpeed || 1
        this.delay = stats.delay || 0
        this.stats = stats;
        this.canAnimate = false;
        this.canShoot = false;
        this.shootHeight = width/2
        this.reversingReload = false;
        this.delayWait = false
        this.shootHeight2 = width
        this.offsetX = stats.offsetX || 0
        this.offsetY = stats.offsetY || 0
        this.angle = host.angle+degToRads(this.angleOffset)
        this.color = "rgb(135,135,135)"
    }
    draw() {
        this.angle = this.host.angle + degToRads(this.angleOffset)
        ctx.save()
        ctx.beginPath()
        let gunX = this.host.x
        let gunY = this.host.y
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
}
export class TankUpgrade {
    constructor(weapon, body, guns, bodyUpg, size) {
        this.isWeapon = weapon
        this.isBody = body
        this.guns = guns
        this.bodyUpg = bodyUpg;
        this.ang = 0;
        this.size = size
        this.image;
        this.upgradeButtons = []
        this.dataURL = null
    }

    getImage() {
        if (this.isWeapon) {
            let imageCanv = document.createElement("canvas")
            imageCanv.width = 300
            imageCanv.height = 300
            let ctx2 = imageCanv.getContext("2d")
            ctx2.save()
            ctx2.beginPath()
            ctx2.translate(150, 150)
            ctx2.rotate(this.ang)
            ctx2.fillStyle = player.color
            ctx2.strokeStyle = darkenRGB(player.color, 15)
            var size = this.size
            ctx2.arc(0, 0, size, 0, Math.PI * 2)
            ctx2.lineWidth = 10
            ctx2.fill()
            ctx2.stroke()
            ctx2.closePath()
            ctx2.restore()
            
            this.guns.forEach((g) => {
                ctx2.save()
                ctx2.beginPath()
                ctx2.translate(150, 150)
                ctx2.rotate(g.stats.angleOffset)
                ctx2.fillStyle = "rgb(135, 135, 135)"
                ctx2.strokeStyle = darkenRGB("rgb(135, 135, 135)", 15)
                ctx2.roundRect(g.stats.offsetX*(size/10), 
                (-g.height/2+g.stats.offsetY)*(size/10),
                 g.width * (size/10), 
                 g.height * (size/10), 0)
                ctx2.closePath()
                ctx2.fill()
                ctx2.stroke()
                ctx2.restore()
            })
            this.dataURL = imageCanv.toDataURL("image/png")
            let img = new Image()
            img.src = this.dataURL
            this.image = img
        }
    }
}
export class UpgradeButton {
    constructor(req, upgrade, tank, offX, tier) {
        this.x = 0
        this.levelRequirement = req
        this.offsetX = offX
        this.upgrade = upgrade
        this.whichTank = tank
        this.isWeapon = tank.isWeapon 
        this.image = null
        this.tier = tier || 0
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = "rgba(136, 154, 255,0.7)"
        ctx.roundRect(
            (this.isWeapon ? 0 : canvas.width)+(this.isWeapon ? 10 + this.offsetX : (-10-this.offsetX)),
            canvas.height-90,
            80,
            80,
            10
        )
        ctx.lineWidth = 8
        ctx.strokeStyle = "rgba(0,0,0,0.7)"
        ctx.fill()
        ctx.stroke()
        this.whichTank.getImage()
        this.image = new Image()
        this.image.src = this.whichTank.dataURL
        ctx.drawImage(
            this.image,
            (this.isWeapon ? 0 : canvas.width)+(this.isWeapon ? 10 + this.offsetX : (-10-this.offsetX)), 
            canvas.height-90, 80, 80
        )
        ctx.closePath()
        this.whichTank.angle += 0.01
    }
}

export var MonoWeapon = new TankUpgrade(true, false, [], [], 60)
MonoWeapon.guns.push(new BarrelForImage(0, 0, 20, 20, MonoWeapon, {}))
export var Mono = new UpgradeButton(0, 0, MonoWeapon, 10, 0)