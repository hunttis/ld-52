import { GameScene, TILE_SIZE } from "../gameScene";
import { eventManager, Events } from "./eventsManager";

class Vector2 extends Phaser.Math.Vector2 {}
const { Distance, Between, Clamp } = Phaser.Math;

enum GuardState {
  PATROLLING,
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
    this.body.setOffset(TILE_SIZE / 3, TILE_SIZE / 3);
    this.body.setCircle(TILE_SIZE / 6);
    this.body.pushable = false;
    this.refreshBody();
    this.setCollideWorldBounds(true);
    this.patrolPath = this.parentScene.level.alarms
      .getChildren()
      .map((alarm) => (alarm as Phaser.GameObjects.Sprite).getCenter());
    Phaser.Utils.Array.Shuffle(this.patrolPath);
    this.anims.create({ key: "guard_move", frames: "guard_move", frameRate: 60, repeat: -1 });
    this.anims.create({ key: "guard_wave", frames: "guard_wave", frameRate: 60, repeat: -1 });
  }

  update() {
    stateActions(this)[this.currentState]();
  }

  getSoundParams(): Phaser.Types.Sound.SoundConfig {
    const detune = Between(-300, 300);
    const distance = Clamp(Distance.BetweenPoints(this, this.parentScene.player), 0, 1000);
    const volume = Clamp(1 - distance / 1000, 0.1, 1);
    const playerPos = this.parentScene.player.body.position;
    const soundVector = new Vector2(this.x - playerPos.x, this.y - playerPos.y);
    const pan = soundVector.normalize().x;
    return { detune, volume, pan };
  }

  patrol() {
    this.anims.play(`guard_move`, true);
    if (this.moveAlongPath()) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPath.length;
      const newTarget = this.patrolPath[this.patrolIndex];
      this.setPathTo(newTarget);
    }

    const { player } = this.parentScene;
    const los = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
    const hits = this.parentScene.level.buildingLayer.getTilesWithinShape(los).filter((tile) => tile.index !== -1);
    const hit = hits.length === 0;
    const closeEnough = Distance.BetweenPoints(this, player) < this.losDistance;

    if (hit && closeEnough) {
      const sound = this.parentScene.angrySounds[Between(0, this.parentScene.angrySounds.length - 1)];
      this.parentScene.sound.play(sound, this.getSoundParams());
      this.currentState = GuardState.WEREWOLF_SEEN;
    }
  }

  werewolfSeen() {
    this.anims.play(`guard_wave`, true);
    const { physics, player } = this.parentScene;
    physics.moveTo(this, player.x, player.y, this.speed * this.runMultiplier);
    if (Distance.BetweenPoints(this, player) < TILE_SIZE) {
      eventManager.emit(Events.GAME_OVER, this.parentScene, {reason: "cleric"});
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
    const targetTile = level.buildingLayer.getTileAt(nextNode.x, nextNode.y, true);
    const targetPoint = { x: targetTile.getCenterX(), y: targetTile.getCenterY() };
    physics.moveTo(this, targetPoint.x, targetPoint.y, this.speed);

    if (Distance.BetweenPoints(this.getCenter(), targetPoint) < TILE_SIZE) this.path.shift();
    return false;
  }
}

const stateActions = (guard: Guard): { [state in GuardState]: () => void } => ({
  [GuardState.PATROLLING]: () => guard.patrol(),
  [GuardState.WEREWOLF_SEEN]: () => guard.werewolfSeen(),
});

eventManager.on(Events.SPAWN_GUARD, (game, { location: { x, y } }) => {
  const guard = new Guard(game, x, y);
  game.guards.add(guard);
  game.add.existing(guard);
  game.physics.world.enable(guard);
  guard.create();
});
