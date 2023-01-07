import { GameScene, TILE_SIZE } from "../gameScene";
import "./deadPeasant";
import { DeadPeasant } from "./deadPeasant";
import { eventManager, Events } from "./eventsManager";

const { Distance } = Phaser.Math;

enum PeasantState {
  PARTY,
  PATROL,
  PANIC,
  NEED_A_BREAK,
  HEAD_TOWARDS_BUSH,
  TINKLE,
}

type Path = { x: number; y: number }[];

export class Peasant extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: PeasantState = PeasantState.PARTY;

  targetBush!: Phaser.GameObjects.Sprite;
  partyTimer: number = 1e3;
  speed: number = 100;
  path: Path = [];

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "Peasant";
    this.speed = Phaser.Math.Between(TILE_SIZE, TILE_SIZE * 2);
  }

  create() {
    this.body.setCircle(TILE_SIZE / 4);
    this.body.pushable = false;
    this.refreshBody();
    this.setCollideWorldBounds(true);
  }

  update(_time: number, delta: number) {
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

  doPatrol(_delta: number) {}

  doPanic(_delta: number) {}

  doNeedABreak(_delta: number) {
    const { level } = this.parentScene;
    const randomBush = level.bushes.getChildren()[
      Phaser.Math.Between(0, level.bushes.children.size - 1)
    ] as Phaser.GameObjects.Sprite;
    this.targetBush = randomBush;
    const { x, y } = level.buildingLayer.getTileAtWorldXY(this.x, this.y, true);
    const { x: endX, y: endY } = level.buildingLayer.getTileAtWorldXY(this.targetBush.x, this.targetBush.y, true);

    level.easyStar.findPath(x, y, endX, endY, (path) => {
      this.path = path;
      this.currentState = PeasantState.HEAD_TOWARDS_BUSH;
    });
    level.easyStar.calculate();
  }

  doHeadTowardsBush(_delta: number) {
    const isDone = this.moveAlongPath();
    if (isDone) this.currentState = PeasantState.TINKLE;
  }

  doTinkle(_delta: number) {}

  moveAlongPath(): boolean {
    const nextNode = this.path[0];
    if (!nextNode) {
      this.setVelocity(0);
      return true;
    }

    const { level, physics } = this.parentScene;
    const target = level.buildingLayer
      .tileToWorldXY(nextNode.x, nextNode.y)
      .add(new Phaser.Math.Vector2(TILE_SIZE / 2));
    physics.moveTo(this, target.x, target.y, this.speed);

    if (Distance.BetweenPoints(this.getCenter(), target) < TILE_SIZE / 2) this.path.shift();
    return false;
  }
}

eventManager.on(Events.PEASANT_KILLED, (game, { location }) => {
  const peasant = new DeadPeasant(game, location.x, location.y);
  game.add.existing(peasant);
});
