export class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
    }
    contains(point) {
        return (
            point.x+point.size >= this.x-this.w &&
            point.x-point.size <= this.x+this.w &&
            point.y+point.size >= this.y-this.h &&
            point.y-point.size <= this.y+this.h
        )
    }
    intersects(point) {
        let closestX = Math.max(this.x - this.w, Math.min(point.x, this.x + this.w));
        let closestY = Math.max(this.y - this.h, Math.min(point.y, this.y + this.h));

        let dx = point.x - closestX;
        let dy = point.y - closestY;

        return (dx * dx + dy * dy) < (point.size * point.size);
    }
}

export class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
        this.collisions = []
    }
    subdivide() {
        let { x, y, w, h } = this.boundary;
        let halfW = w / 2;
        let halfH = h / 2;

        let ne = new Rect(x, y, halfW, halfH);
        let nw = new Rect(x + halfW, y, halfW, halfH);
        let se = new Rect(x, y + halfH, halfW, halfH);
        let sw = new Rect(x + halfW, y + halfH, halfW, halfH);
        this.ne = new QuadTree(ne, this.capacity)
        this.nw = new QuadTree(nw, this.capacity)
        this.se = new QuadTree(se, this.capacity)
        this.sw = new QuadTree(sw, this.capacity)
    }
    draw(ctx, camera) {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = "rgba(255, 255, 255, 1)"
        ctx.strokeRect(this.boundary.x - camera.x, this.boundary.y - camera.y, this.boundary.w, this.boundary.h)
        ctx.stroke()
        ctx.closePath()
    
        if (this.divided) {
            this.nw.draw(ctx, camera);
            this.ne.draw(ctx, camera);
            this.sw.draw(ctx, camera);
            this.se.draw(ctx, camera);
        }
    }
    reset() {
        this.points = []
        this.collisions = []
        this.divided = false
        this.ne = null
        this.nw = null
        this.se = null
        this.sw = null
    }
    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point)
        } else {
            if (!this.divided) {
                this.subdivide();
                this.divided = true;
            }
            if (this.ne.boundary.intersects(point)) {
                this.ne.insert(point);
            }
            if (this.nw.boundary.intersects(point)) {
                this.nw.insert(point);
            }
            if (this.se.boundary.intersects(point)) {
                this.se.insert(point);
            }
            if (this.sw.boundary.intersects(point)) {
                this.sw.insert(point);
            }
        } 
    }
    groupCollisionCheck() {
        this.collisions = []
        this.points.forEach((p) => {
            let group = [p]
            for (let i = 0; i < this.points.length; i++) {
                if (p !== this.points[i] && this.collideCheck(p, this.points[i])) {
                    if (!group.includes(this.points[i])) {
                        group.push(this.points[i])
                    }
                }
            }

            if (group.length > 1) {
                this.collisions.push(group)
            }
        })
        if (this.divided) {
            this.collisions.push(...this.nw.groupCollisionCheck())
            this.collisions.push(...this.ne.groupCollisionCheck())
            this.collisions.push(...this.sw.groupCollisionCheck())
            this.collisions.push(...this.se.groupCollisionCheck())
        }
        return this.collisions
    }
    collideCheck(a, b) {
        let dx = b.x - a.x
        let dy = b.y - a.y
        let sqDist = dx * dx + dy * dy
        let radius = a.size + b.size
        return sqDist < Math.pow(radius, 2)
    }
}