// TODO: CONNECT A TANK CLASS THAT SUPPORTS UPGRADES
// [Weapon]-[Body]

import { ctx, canvas, darkenRGB } from "./main.js"
import { Barrel } from "./entities.js"

export class TankUpgrade {
    constructor(weapon, body, guns, bodyUpg) {
        this.isWeapon = weapon
        this.isBody = body
        this.guns = guns
        this.bodyUpg = bodyUpg
        this.dataURL = null
    }

    getImage() {
        if (this.isWeapon) {
            let imageCanv = document.createElement("canvas")
            imageCanv.width = 300
            imageCanv.height = 300
            let ctx2 = imageCanv.getContext("2d")
            ctx2.beginPath()
            ctx2.translate(150, 150)
            ctx2.fillStyle = "rgb(0, 255, 0)"
            ctx2.strokeStyle = darkenRGB("rgb(0, 255, 0)", 15)
            var size = 30
            ctx2.arc(0, 0, 30, 0, Math.PI * 2)
            ctx2.fill()
            ctx2.stroke()
            ctx2.closePath()
            ctx2.restore()
            
            ctx2.weapon.forEach((g) => {
                ctx2.save()
                ctx2.beginPath()
                ctx2.rotate(g.stats.angleOffset)
                ctx2.fillStyle = "rgb(135, 135, 135)"
                ctx2.strokeStyle = darkenRGB("rgb(135, 135, 135)", 15)
                ctx2.roundRect(g.offsetX*(size/10), 
                (-g.height/2+g.offsetY)*(size/10),
                 g.width * (size/10), 
                 g.height * (size/10), 0)
                ctx2.closePath()
                ctx2.rotate()
            })
            this.dataURL = imageCanv.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = this.dataURL
            link.download = "tank.png"
            link.click()
        }
    }
}
export class UpgradeButton {
    constructor(req, upgrade, tank, weapon, offX, tier) {
        this.levelRequirement = req
        this.offsetX = offX
        this.upgrade = upgrade
        this.whichTank = tank
        this.image = null
        this.isWeapon = weapon
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
        this.image = new Image()
        this.image.src = this.upgrade.getImage()
        ctx.drawImage(this.image, 
            canvas.height-70, 
            (this.isWeapon ? 0 : canvas.width)+(this.isWeapon ? 10 + this.offsetX : (-10-this.offsetX)), 
            40, 40
        )
        ctx.closePath()
    }
}

export var Mono = new TankUpgrade()