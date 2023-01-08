import { GameScene } from "./scenes/gameScene";
import { MenuScene } from "./scenes/menuScene";
import { GameOverScene } from "./scenes/gameoverScene";
import { GameWinScene } from "./scenes/gameWinScene";
import "vite/types/importMeta.d"; // Not needed when not using TypeScript

const hotReload = true;

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    title: "Phaser game example",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 768,
    },
    physics: {
      default: "arcade",
    },
    parent: "game",
    scene: [MenuScene, GameScene, GameOverScene, GameWinScene],
  };

  return new Phaser.Game(config);
}

// This prevents hot reload, which is useful when you're developing in live share
if (!hotReload && import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    throw "(skipping full reload)";
  });
}
