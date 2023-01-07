import { GameScene, TILE_SIZE } from "../gameScene";

enum PeasantState {
  PARTY,
  PATROL,
  PANIC,
  NEED_A_BREAK,
  HEAD_TOWARDS_BUSH,
  TINKLE,
}

export class Peasant extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: PeasantState = PeasantState.PARTY;

  targetBush!: Phaser.GameObjects.Sprite;
  partyTimer: number = 1e3;
  speed: number = 100;

  path: { x: number; y: number }[] = [];
  nextNode?: { x: number; y: number };

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "Peasant";
    this.speed = Phaser.Math.Between(TILE_SIZE, TILE_SIZE * 2);
  }

  update(time: number, delta: number) {
    // console.log(this.currentState);
    switch (this.currentState) {
      case PeasantState.PARTY:
        this.doParty(delta);
        break;
      case PeasantState.PATROL:
        this.doPatrol(delta);
        break;
      case PeasantState.PANIC:
        this.doPanic(delta);
        break;
      case PeasantState.NEED_A_BREAK:
        this.doNeedABreak(delta);
        break;
      case PeasantState.HEAD_TOWARDS_BUSH:
        this.doHeadTowardsBush(delta);
        break;
      case PeasantState.TINKLE:
        this.doTinkle(delta);
        break;
      default:
        console.log("WTFBBQ?!");
    }
  }

  doParty(delta: number) {
    // console.log("Par-tayy " + this.partyTimer);
    this.partyTimer -= delta;
    if (this.partyTimer < 0) {
      this.currentState = PeasantState.NEED_A_BREAK;
    }
  }

  doPatrol(delta: number) {}

  doPanic(delta: number) {}

  doNeedABreak(delta: number) {
    const randomBush = this.parentScene.level.bushes.getChildren()[
      Phaser.Math.Between(0, this.parentScene.level.bushes.children.size - 1)
    ] as Phaser.GameObjects.Sprite;
    this.targetBush = randomBush;
    const { x, y } = this.parentScene.level.buildingLayer.getTileAtWorldXY(this.x, this.y, true);
    const { x: endX, y: endY } = this.parentScene.level.buildingLayer.getTileAtWorldXY(
      this.targetBush.x,
      this.targetBush.y,
      true
    );

    this.parentScene.level.easyStar.findPath(x, y, endX, endY, (path) => {
      this.path = path;
      this.path.shift();
      this.currentState = PeasantState.HEAD_TOWARDS_BUSH;
    });
    this.parentScene.level.easyStar.calculate();
  }

  // doHeadTowardsBush(delta: number) {
  //   const target = this.path[0];
  //   if (!target) {
  //     this.currentState = PeasantState.TINKLE;
  //     return;
  //   }

  //   const location = this.parentScene.level.buildingLayer.getTileAtWorldXY(this.x, this.y, true);

  //   if (Phaser.Math.Distance.BetweenPoints(target, location) < TILE_SIZE / 2) {
  //     this.path.shift();
  //     return;
  //   }

  //   this.parentScene.physics.moveTo(this, target.x * TILE_SIZE, target.y * TILE_SIZE, this.speed);
  // }

  doHeadTowardsBush(delta: number) {
    if (this.nextNode) {
      const nextNodeLocation = {
        x: this.nextNode.x * TILE_SIZE + TILE_SIZE / 2,
        y: this.nextNode.y * TILE_SIZE + TILE_SIZE / 2,
      };
      if (this.nextNode && Phaser.Math.Distance.BetweenPoints(nextNodeLocation, this) < TILE_SIZE / 2) {
        this.nextNode = undefined;
      }
    }

    if (!this.nextNode) {
      this.nextNode = this.path.shift();
      if (this.nextNode) {
        this.parentScene.physics.moveTo(
          this,
          this.nextNode.x * TILE_SIZE + TILE_SIZE / 2,
          this.nextNode.y * TILE_SIZE + TILE_SIZE / 2,
          this.speed
        );
      } else {
        this.currentState = PeasantState.TINKLE;
        this.setVelocity(0);
      }
    }
  }

  doTinkle(delta: number) {}

  moveTowards(delta: number) {}
}
