import { GameScene } from "./scenes/gameScene";
import "vite/types/importMeta.d"; // Not needed when not using TypeScript

const hotReload = true;

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    title: "Phaser game example",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    parent: "game",
    scene: [GameScene],
  };

  return new Phaser.Game(config);
}

// This prevents hot reload, which is useful when you're developing in live share
if (!hotReload && import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    throw "(skipping full reload)";
  });
}
