// TODO: CONNECT A TANK CLASS THAT SUPPORTS UPGRADES
// [Weapon]-[Body]

import { ctx, canvas } from "./main.js"

export class TankUpgrade {
    constructor(levelReq, weapon, body, guns, bodyUpg) {
        this.levelRequirement = levelReq
        this.isWeapon = weapon
        this.isBody = body
        this.guns = guns
        this.bodyUpg = bodyUpg
    }
}
export class UpgradeButton {
    constructor(upgrades, tank, weapon, offX) {
        this.offsetX = offX
        this.upgrades = upgrades
        this.whichTank = tank
        this.isWeapon = weapon
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
        ctx.closePath()
    }
}