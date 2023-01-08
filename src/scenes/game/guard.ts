import { GameScene, TILE_SIZE } from "../gameScene";
import { eventManager, Events } from "./eventsManager";

class Vector2 extends Phaser.Math.Vector2 {}
const { Distance } = Phaser.Math;

enum GuardState {
  PATROLLING,
  BODY_SEEN,
  WEREWOLF_SEEN,
}

export class Guard extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: GuardState = GuardState.PATROLLING;

  losDistance: number = 300;

  speed: number = TILE_SIZE;
  runMultiplier: number = 3;
  patrolPath: Vector2[] = [];
  patrolIndex = 0;

  path: Vector2[] = [];

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "Guard";
    this.speed = Phaser.Math.Between(TILE_SIZE, TILE_SIZE * 2);
  }

  create() {
    this.body.setCircle(TILE_SIZE / 4);
    this.body.pushable = false;
    this.refreshBody();
    this.setCollideWorldBounds(true);
    this.patrolPath = this.parentScene.level.alarms
      .getChildren()
      .map((alarm) => (alarm as Phaser.GameObjects.Sprite).getCenter());
    Phaser.Utils.Array.Shuffle(this.patrolPath);
  }

  update() {
    stateActions(this)[this.currentState]();
  }

  patrol() {
    if (this.moveAlongPath()) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPath.length; // In order
      // this.patrolIndex = Phaser.Math.Between(0, this.patrolPath.length - 1); // Randomly
      const newTarget = this.patrolPath[this.patrolIndex];
      this.setPathTo(newTarget);
    }

    const { player } = this.parentScene;
    const los = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
    const hits = this.parentScene.level.buildingLayer.getTilesWithinShape(los).filter((tile) => tile.index !== -1);
    const hit = hits.length === 0;
    const closeEnough = Distance.BetweenPoints(this, player) < this.losDistance;

    if (hit && closeEnough) this.currentState = GuardState.WEREWOLF_SEEN;
  }

  bodySeen() {}

  werewolfSeen() {
    const { physics, player } = this.parentScene;
    physics.moveTo(this, player.x, player.y, this.speed * this.runMultiplier);
    if (Distance.BetweenPoints(this, player) < TILE_SIZE) {
      eventManager.emit(Events.GAME_OVER, this.parentScene, {});
    } else if (Distance.BetweenPoints(this, player) > TILE_SIZE * 12) {
      this.currentState = GuardState.PATROLLING;
    }
  }

  private setPathTo(target: Vector2, cb?: (path: Vector2[]) => void) {
    const { x: targetX, y: targetY } = target;
    const { level } = this.parentScene;
    const { x, y } = level.buildingLayer.getTileAtWorldXY(this.x, this.y, true);
    const { x: endX, y: endY } = level.buildingLayer.getTileAtWorldXY(targetX, targetY, true);
    level.easyStar.findPath(x, y, endX, endY, (path) => {
      this.path = path.map(({ x, y }) => new Vector2(x, y));
      cb?.(this.path);
    });
    level.easyStar.calculate();
  }

  private moveAlongPath(): boolean {
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

const stateActions = (guard: Guard): { [state in GuardState]: () => void } => ({
  [GuardState.PATROLLING]: () => guard.patrol(),
  [GuardState.BODY_SEEN]: () => guard.bodySeen(),
  [GuardState.WEREWOLF_SEEN]: () => guard.werewolfSeen(),
});

eventManager.on(Events.SPAWN_GUARD, (game, { location }) => {});
