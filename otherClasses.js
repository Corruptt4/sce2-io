import { ctx, killNotifs } from "./main.js"
export class Minimap {
    constructor(x, y, width, world) {
        this.x = x;
        this.y = y;
        this.sideLength = width;
        this.scaleDown = width / world;
        this.entities = []
        this.zones = []
    }

    draw() {
        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.roundRect(this.x, this.y, this.sideLength*1.5, this.sideLength*1.5, 5)
        ctx.fillStyle = "rgb(235, 235, 235)"
        ctx.lineWidth = 4
        ctx.strokeStyle = "rgb(0,0,0)"
        ctx.fill()
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.closePath()

        this.entities.forEach((e) => {
            if (e.type !== "bullet" && e.type !== "polygon") {
                ctx.beginPath()
                ctx.globalAlpha = 0.5
                ctx.arc(this.x+this.sideLength/2+e.x*this.scaleDown, this.y+this.sideLength/2+e.y*this.scaleDown, 1.5, 0, Math.PI * 2)
                ctx.fillStyle = e.type === "player" ? "rgb(0, 0, 0)" : e.color
                if (e.radiant) {
                    e.radiantB()
                }
                ctx.fill()
                ctx.globalAlpha = 1
                ctx.closePath()
            }
        })
        this.zones.forEach((e) => {
            ctx.beginPath()
            ctx.globalAlpha = 0.5
            ctx.fillStyle = e.color
            ctx.fillRect(
                this.x+this.sideLength/2+e.x*this.scaleDown,
                this.y+this.sideLength/2+e.y*this.scaleDown,
                this.l*this.scaleDown,
                this.l*this.scaleDown,
            )
            ctx.closePath()
        })
    }
}
export class KillNotif {
    constructor(x, y, color, text) {
        this.x = x;
        this.y = y;
        this.setX = x
        this.targetX = null;
        this.width = 0
        this.color = color;
        this.text = text;
        this.lifeTime = 150
    }
    draw() {
        ctx.beginPath()
        ctx.font = "15px sans-serif"
        ctx.fillStyle = this.color
        ctx.textAlign = "right"
        this.width = ctx.measureText("! " + this.text + " !").width
        ctx.fillText("! " + this.text + " !", this.x, this.y)
        ctx.closePath()
    }
    move() {
        this.targetX = this.setX + this.width
        this.x += (this.targetX - this.x) * 0.1
        this.y += 8
        this.lifeTime--
        if (this.lifeTime <= 0) {
            killNotifs.splice(killNotifs.indexOf(this), 1)
        }
    }
}