import { ctx, killNotifs, globalBots, player, fps, setFPS, darkenRGB, abreviatedNumber } from "./main.js"
export class Minimap {
    constructor(x, y, width, world, zones) {
        this.x = x;
        this.y = y;
        this.sideLength = width;
        this.scaleDown = width / world;
        this.entities = []
        this.zones = zones
        this.fpsFillColor = "rgb(255, 255, 255)"
    }

    draw() {
        ctx.save()
        ctx.translate(this.x+this.sideLength/2, this.y+this.sideLength/2)
        
        ctx.beginPath()
        // FPS colors
        if (setFPS > 40) {
            this.fpsFillColor = "rgb(255, 255, 255)"
        } else if (setFPS <= 40 && setFPS > 30) {
            this.fpsFillColor = "rgb(255, 145, 0)"
        }  else if (setFPS <= 30) {
            this.fpsFillColor = "rgb(255, 0, 0)"
        }

        ctx.fillStyle = this.fpsFillColor
        ctx.lineWidth = 4
        ctx.strokeStyle = darkenRGB(this.fpsFillColor, 30)
        ctx.font = "25px Arial"
        ctx.textAlign = "left"
        ctx.strokeText("FPS: " + setFPS, -this.sideLength/2 - 2, this.sideLength + 30)
        ctx.fillText("FPS: " + setFPS, -this.sideLength/2 - 2, this.sideLength + 30)
        ctx.closePath()

        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.roundRect(-this.sideLength/2, -this.sideLength/2, this.sideLength*1.5, this.sideLength*1.5, 5)
        ctx.fillStyle = "rgb(235, 235, 235)"
        ctx.lineWidth = 4
        ctx.strokeStyle = "rgb(0,0,0)"
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.closePath()

        ctx.clip()
        
        this.zones.forEach((e) => {
            ctx.beginPath()
            ctx.globalAlpha = 0.4
            ctx.fillStyle = e.color
            ctx.fillRect(
                e.x * this.scaleDown,
                e.y * this.scaleDown,
                e.lw * this.scaleDown,
                e.lh * this.scaleDown
            )
            ctx.closePath()
        })
        ctx.restore()
        
        ctx.beginPath()
        ctx.globalAlpha = 1
        ctx.roundRect(this.x, this.y, this.sideLength*1.5, this.sideLength*1.5, 5)
        ctx.fillStyle = "rgb(235, 235, 235, 0)"
        ctx.lineWidth = 4
        ctx.strokeStyle = "rgb(0,0,0)"
        ctx.fill()
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.closePath()
        

        this.entities.forEach((e) => {
            if (e.type !== "bullet" && e.type !== "polygon" && e.team == player.team) {
                ctx.save()
                ctx.translate(this.x+this.sideLength/2 + e.x * this.scaleDown, this.y+this.sideLength/2 + e.y * this.scaleDown)
                ctx.beginPath()
                ctx.rotate(e.angle)
                ctx.globalAlpha = 0.5
                //ctx.arc(e.x * this.scaleDown, e.y * this.scaleDown, 1.5, 0, Math.PI * 2)
                ctx.moveTo(-3, 2)
                ctx.lineTo(3, 0)
                ctx.lineTo(-3, -2)
                ctx.fillStyle = e.type === "player" ? "rgb(0, 0, 0)" : e.color
                if (e.radiant) {
                    e.radiantB()
                }
                ctx.fill()
                ctx.globalAlpha = 1
                ctx.rotate(-e.angle)
                ctx.closePath()
                ctx.restore()
            }
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

export class Leaderboard {
    constructor(x, y, entries) {
        this.x = x;
        this.y = y;
        this.entries = entries;
        this.tanks = [];
        this.ranks = [];
    }

    update() {
        this.tanks = globalBots.concat(player)
        this.tanks.sort((a, b) => b.totalXP - a.totalXP);
        this.ranks = this.tanks.slice(0, 10).map(tank => [tank.color, tank.totalXP]);

        while (this.ranks.length < 10) {
            this.ranks.push(["grey", 0, "entry", "???", "???"]);
        } 
        for (let i = 0; i < 10; i++) {
            let tank = this.tanks[i] || { 
                color: "grey",
                totalXP: 0,
                type: "entry",
                wepUpg: "???",
                bodUpg: "???"
            };
            this.ranks[i][0] = tank.color
            this.ranks[i][1] = tank.totalXP
            this.ranks[i][2] = tank.type
            this.ranks[i][3] = tank.weaponUpgrade
            this.ranks[i][4] = tank.bodyUpgrade
            this.ranks.splice(11, this.tanks.length)
        }
    }

    draw() {
        ctx.globalAlpha = 1
        for (let i = 0; i < this.ranks.length; i++) {
            let barWidth = Math.max(20, (200 * this.ranks[i][1]) / (this.ranks[0][1]+1));

            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.roundRect(this.x, this.y + 20 * (i + 1), 200, 15, 15);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = this.ranks[i][0];
            ctx.roundRect(this.x, this.y + 20 * (i + 1), barWidth, 15, 15);
            ctx.fill();

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "10px sans-serif";
            ctx.stroke();
            ctx.lineWidth = 6
            ctx.lineJoin = "round"
            ctx.strokeText(this.ranks[i][1].toFixed(0), this.x + 100, this.y + 10 + 20 * (i + 1))
            ctx.fillText(this.ranks[i][1].toFixed(0), this.x + 100, this.y + 10 + 20 * (i + 1));
            ctx.strokeText("Top " + (i+1), this.x - 20, this.y + 10 + 20 * (i + 1))
            ctx.fillText("Top " + (i+1), this.x - 20, this.y + 10 + 20 * (i + 1));
            
            ctx.strokeText(this.ranks[i][3] + "-" + this.ranks[i][4], this.x + 25, this.y + 10 + 20 * (i + 1))
            ctx.fillText(this.ranks[i][3] + "-" + this.ranks[i][4], this.x + 25, this.y + 10 + 20 * (i + 1));
            ctx.closePath();
        }
        
        ctx.beginPath()
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.textAlign = "center";
        ctx.font = "20px sans-serif";
        ctx.fillText("LEADERBOARD", this.x, this.y)
        ctx.closePath()
    }
}

export class InfoBar {
    constructor(x, y, width, height, type, player) {
        /** 
         * Types:
         * 1. Level
         * 2. XP bar
         * 3. Leaderboard bar (shows your rank)
         * 
         * Could be:
         * LV
         * XP
         * LBB
         */
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.player = player;
        this.color = "rgba(255, 255, 255, 0.6)"
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = darkenRGB(this.color, 0)
        ctx.strokeStyle = darkenRGB("rgb(255, 255, 255)", 15)
        ctx.lineWidth = 10
        ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, this.height)
        ctx.stroke()
        ctx.fill()
        ctx.closePath()

        if (this.type === typeof String) {
            this.type.toLowerCase()
        }

        switch (this.type) {
            case "lv": {
                ctx.beginPath()
                ctx.lineWidth = 4
                ctx.lineJoin = "round"
                ctx.font = "20px Arial"
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.textAlign = "left"
                ctx.strokeText("Level: ", this.x - this.width/2 + 15, this.y + 20/3)
                ctx.fillText("Level: ", this.x - this.width/2 + 15, this.y + 20/3)
                ctx.textAlign = "right"
                ctx.strokeText(this.player.level, this.x + this.width/2 - 15, this.y + 20/3)
                ctx.fillText(this.player.level, this.x + this.width/2 - 15, this.y + 20/3)
                ctx.textAlign = "center"
                ctx.strokeText(abreviatedNumber(this.player.xp) + " / " + abreviatedNumber(this.player.xpToNext), this.x, this.y + 20/3)
                ctx.fillText(abreviatedNumber(this.player.xp) + " / " + abreviatedNumber(this.player.xpToNext), this.x, this.y + 20/3)
                ctx.closePath()
                break;
            }
            case "xp": {
                ctx.beginPath()
                ctx.lineWidth = 4
                ctx.lineJoin = "round"
                ctx.font = "15px Ubuntu"
                ctx.fillStyle = "white"
                ctx.strokeStyle = "black"
                ctx.textAlign = "center"
                ctx.strokeText(abreviatedNumber(this.player.totalXP), this.x, this.y + 15/3)
                ctx.fillText(abreviatedNumber(this.player.totalXP), this.x, this.y + 15/3)
                ctx.closePath()
            }
        }
    }
}
