import { canvas, camera, ctx } from "./main.js"

export function updateCamera(player) {
    camera.x = player.x - (canvas.width) / 2;
    camera.y = player.y - (canvas.height ) / 2;
}

export function degToRads(deg) {
    return deg * (Math.PI / 180)
}

export function randomElement(list) {
    return list[Math.floor(Math.random() * list.length)]
}

export function boxClick(mx, my, x, y, w, h) {
    return (
        mx > x && mx < mx + w &&
        my > y && my < my + h
    )
}