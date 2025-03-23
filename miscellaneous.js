import { canvas } from "./main.js"

export const camera = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
}
export function updateCamera() {
    camera.x = Math.max(
        0,
        Math.min(
            canvas.width - camera.width,
            player.x - camera.width / 2,
        ),
    );
    camera.y = Math.max(
        0,
        Math.min(
            canvas.height - camera.height,
            player.y - camera.height / 2,
        ),
    );
}