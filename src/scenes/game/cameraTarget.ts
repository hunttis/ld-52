import { GameScene } from "../gameScene";

export class CameraTarget extends Phaser.GameObjects.Sprite {
  parentScene: GameScene;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "CameraTarget";
  }
}
