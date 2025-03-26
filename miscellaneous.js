import { canvas, camera, ctx } from "./main.js"

export function updateCamera(player) {
    camera.x = player.x - (canvas.width*player.fov) / 2;
    camera.y = player.y - (canvas.height*player.fov) / 2;
}

