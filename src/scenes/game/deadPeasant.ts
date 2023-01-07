import { GameScene } from "../gameScene";

enum DeadPeasantState {
  STILL,
  CARRIED,
  BURIED,
}

export class DeadPeasant extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: DeadPeasantState = DeadPeasantState.STILL;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "blood"); // Should probably be a bloody body instead of just blood
    this.parentScene = gameScene;
    this.name = "DeadPeasant";
    this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
  }
}
