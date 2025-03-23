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