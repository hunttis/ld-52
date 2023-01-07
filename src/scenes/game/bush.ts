import { GameScene,  } from "../gameScene";

enum BushState {
  FREE,
  OCCUPIED,
}

export class Bush extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: BushState = BushState.FREE;

  maxTinklers!: number;
  currentTinklers: number = 0;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "bush");
    this.parentScene = gameScene;
    this.name = "Bush";
    this.maxTinklers = Math.round((Math.random() * 4) + 1);
  }


  update() {
    switch (this.currentState) {
      case BushState.FREE:
        // TODO: Check for availability and fire event if maxTinklers is reached
        break;
      case BushState.OCCUPIED:
        // TODO: Check for availability and fire event if space freed up
        break;
    }
  }

  isFree() {
    return
  }

  addTinkler() {
    this.currentTinklers++;
  }

  removeTinkler() {
    this.currentTinklers--;
  }
}
