import { GameScene, TILE_SIZE } from "../gameScene";

enum GuardState {
  PATROLLING,
  BODY_SEEN,
  WEREWOLF_SEEN,
}

export class Guard extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: GuardState = GuardState.PATROLLING;

  speed: number = 200;
  patrolPath = [];
  // path: Path = [];

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "Guard";
  }

  create() {
    this.body.setCircle(TILE_SIZE / 4);
    this.body.pushable = false;
    this.refreshBody();
    this.setCollideWorldBounds(true);
  }
}
