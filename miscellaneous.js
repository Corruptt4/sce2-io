import { canvas, camera, ctx } from "./main.js"

export function updateCamera(player) {
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}

