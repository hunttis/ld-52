import { GameScene } from "./scenes/gameScene";

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    title: "Phaser game example",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 800,
    },
    parent: "game",
    scene: [GameScene],
  };

  return new Phaser.Game(config);
}
