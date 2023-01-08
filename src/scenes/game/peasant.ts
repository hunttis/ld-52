import { Vector } from "matter";
import { GameScene, TILE_SIZE } from "../gameScene";
import { eventManager, Events } from "./eventsManager";

const { Distance } = Phaser.Math;

enum PeasantState {
  PARTY,
  PATROL,
  PANIC,
  HEAD_TOWARDS_BELL,
  RING_BELL,
  NEED_A_BREAK,
  HEAD_TOWARDS_BUSH,
  TINKLE,
  TINKLE_DONE,
  HEAD_BACK_TO_PARTY,
  IDLE,
}

type Point = { x: number; y: number };
type Path = Point[];
export type Gender = "man" | "woman";

export class Peasant extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: PeasantState = PeasantState.PARTY;
  MAX_PARTY_TIME: number = 60_000;
  MAX_TINKLE_TIME: number = 5_000;
  PANIC_SPEED_MULTIPLIER: number = 3.5;
  NORMAL_LOS_DISTANCE: number = 300;
  TINKLE_LOS_DISTANCE: number = 75;
  POUNCE_CD: number = 1_000;

  LOS_DISTANCE: number = 250;

  debugDrawLos: boolean = false;
  debugLos!: Phaser.GameObjects.Graphics;

  targetBush!: Phaser.GameObjects.Sprite;
  // Maybe there's a type for this?
  positionBeforeTinkle!: { x: number; y: number };
  partyTimer: number = 0;
  tinkleTimer: number = 0;
  speed: number = 100;
  path: Path = [];
  targetBell!: Phaser.GameObjects.Sprite;
  panicIndicator!: Phaser.GameObjects.Sprite;
  susMeterMax: number = 1000;
  susMeter: number = 0;
  gender!: Gender;
  panicSoundPlayed: boolean = false;
  PARTY_SOUND_COOLDOWN_MAX: number = 30_000;
  PARTY_SOUND_COOLDOWN_MIN: number = 5_000;
  partySoundCooldown!: number;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number) {
    super(gameScene, xLoc, yLoc, "null");
    this.parentScene = gameScene;
    this.name = "Peasant";
    this.speed = Phaser.Math.Between(TILE_SIZE, TILE_SIZE * 2);
    this.resetTinkleTimer();
    this.resetPartyTimer();
    this.resetPartySoundTimer();
    this.gender = Math.random() > 0.5 ? "man" : "woman";
  }

  private getClosestObject(targets: Phaser.GameObjects.Sprite[]): Phaser.GameObjects.Sprite {
    // Only calculate the distance between current point and every target and just deconstruct the index out of the result
    const { index } = targets.reduce(
      (closest, cur, index) => {
        const distance = Distance.BetweenPoints(this, cur);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: -1, distance: Number.POSITIVE_INFINITY }
    );

    return targets[index];
  }

  private getRandomObject(targets: Phaser.GameObjects.Sprite[]): Phaser.GameObjects.Sprite {
    return targets[Phaser.Math.Between(0, targets.length - 1)];
  }

  private resetTinkleTimer() {
    this.tinkleTimer = this.MAX_TINKLE_TIME * Math.random() + 1_000;
  }

  private resetPartyTimer() {
    this.partyTimer = this.MAX_PARTY_TIME * Math.random() + 2_000;
  }

  private resetPartySoundTimer() {
    this.partySoundCooldown = this.PARTY_SOUND_COOLDOWN_MAX * Math.random() + 5_000;
    console.log(this.partySoundCooldown);
  }

  private setPathTo(target: Point, cb: (path: Path) => void) {
    const { x: targetX, y: targetY } = target;
    const { level } = this.parentScene;
    const { x, y } = level.buildingLayer.getTileAtWorldXY(this.x, this.y, true);
    const { x: endX, y: endY } = level.buildingLayer.getTileAtWorldXY(targetX, targetY, true);
    level.easyStar.findPath(x, y, endX, endY, (path) => {
      this.path = path;
      cb(path);
    });
    level.easyStar.calculate();
  }

  private drawLos(los: Phaser.Geom.Line) {
    this.debugLos.clear().strokeCircle(this.x, this.y, this.LOS_DISTANCE);
    this.parentScene.debugGraphics.clear();
    this.parentScene.debugGraphics.strokeLineShape(los);
  }

  create() {
    this.body.setOffset(TILE_SIZE * 0.25, TILE_SIZE * 0.3);
    this.body.setCircle(TILE_SIZE / 4);
    this.body.pushable = false;
    this.refreshBody();
    this.setCollideWorldBounds(true);
    this.panicIndicator = this.parentScene.add.sprite(this.x, this.y, "peasant_panic");
    this.panicIndicator.setOrigin(0, 0.5);
    this.panicIndicator.setVisible(false);
    this.debugLos = this.parentScene.add.graphics({ lineStyle: { color: 0xff0055 } });
    this.anims.create({
      key: "peasant_man_walk",
      frames: "peasant_man_walk",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "peasant_man_party",
      frames: "peasant_man_party",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "peasant_man_idle",
      frames: "peasant_man_idle",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "peasant_woman_walk",
      frames: "peasant_woman_walk",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "peasant_woman_party",
      frames: "peasant_woman_party",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "peasant_woman_idle",
      frames: "peasant_woman_idle",
      frameRate: 60,
      repeat: -1,
    });
  }

  destroy(): void {
    this.panicIndicator.destroy();
    super.destroy();
  }

  update(_time: number, delta: number) {
    // console.log(this.currentState);
    switch (this.currentState) {
      case PeasantState.PARTY:
        this.checkLos(delta);
        this.playPartyAnimation();
        this.doParty(delta);
        break;
      case PeasantState.PATROL:
        this.doPatrol(delta);
        break;
      case PeasantState.PANIC:
        this.doPanic(delta);
        break;
      case PeasantState.HEAD_TOWARDS_BELL:
        this.playWalkAnimation();
        this.moveAndUpdateStateWhenDone(PeasantState.RING_BELL, delta, () => {
          this.panicIndicator.setPosition(this.x, this.y);
        });
        break;
      case PeasantState.RING_BELL:
        this.playIdleAnimation();
        this.doRingBell(delta);
        break;
      case PeasantState.NEED_A_BREAK:
        this.doNeedABreak(delta);
        break;
      case PeasantState.HEAD_TOWARDS_BUSH:
        this.checkLos(delta);
        this.playWalkAnimation();
        this.moveAndUpdateStateWhenDone(PeasantState.TINKLE, delta);
        break;
      case PeasantState.TINKLE:
        this.playIdleAnimation();
        this.checkLos(delta);
        this.doTinkle(delta);
        break;
      case PeasantState.TINKLE_DONE:
        this.doTinkleDone(delta);
        break;
      case PeasantState.HEAD_BACK_TO_PARTY:
        this.checkLos(delta);
        this.playWalkAnimation();
        this.moveAndUpdateStateWhenDone(PeasantState.PARTY, delta);
        break;
      case PeasantState.IDLE:
        break;
      default:
        console.log("WTFBBQ?!");
    }
  }

  playWalkAnimation() {
    this.anims.play(`peasant_${this.gender}_walk`, true);
  }
  playDeathAnimation() {}
  playPartyAnimation() {
    this.anims.play(`peasant_${this.gender}_party`, true);
  }
  playIdleAnimation() {
    this.anims.play(`peasant_${this.gender}_idle`, true);
  }

  checkLos(delta: number) {
    const { player } = this.parentScene;
    const los = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
    const hits = this.parentScene.level.buildingLayer.getTilesWithinShape(los).filter((tile) => tile.index !== -1);
    const hit = hits.length === 0;
    const closeEnough = Distance.BetweenPoints(this, player) < this.LOS_DISTANCE;
    if (this.debugDrawLos) {
      this.drawLos(los);
      console.log(hit, closeEnough);
    }

    if (hit && closeEnough) {
      this.susMeter = Phaser.Math.Clamp(this.susMeter + delta, 0, this.susMeterMax);
      if (this.susMeter >= this.susMeterMax) this.currentState = PeasantState.PANIC;
    } else {
      this.susMeter = Phaser.Math.Clamp(this.susMeter - delta, 0, this.susMeterMax);
    }
  }

  moveAndUpdateStateWhenDone(endState: PeasantState, _delta?: number, mutator?: () => void) {
    const isDone = this.moveAlongPath();
    if (mutator) mutator();
    if (isDone) this.currentState = endState;
  }

  doParty(delta: number) {
    // console.log("Par-tayy " + this.partyTimer);
    this.partyTimer -= delta;
    this.partySoundCooldown -= delta;

    if (this.partySoundCooldown < 0) {
      const partySound = Phaser.Math.Between(0, this.parentScene.happySounds.length - 1);
      console.log("Volume of sound would be:", this.getSoundParams());

      this.parentScene.sound.play(this.parentScene.happySounds[partySound], this.getSoundParams());
      this.partySoundCooldown = this.PARTY_SOUND_COOLDOWN_MAX;
    }
    if (this.partyTimer < 0) {
      this.currentState = PeasantState.NEED_A_BREAK;
      this.resetPartyTimer();
    }
  }

  getSoundParams(): Phaser.Types.Sound.SoundConfig {
    const detuneCount = Phaser.Math.Between(-200, 200);
    const distance = Phaser.Math.Clamp(Phaser.Math.Distance.BetweenPoints(this, this.parentScene.player), 0, 1000);
    const playerPos = this.parentScene.player.body.position;
    let soundVector = new Phaser.Math.Vector2(this.x - playerPos.x, this.y - playerPos.y);
    soundVector = soundVector.normalize();

    return { detune: detuneCount, volume: Phaser.Math.Clamp(1 - distance / 1000, 0.1, 1), pan: soundVector.x };
  }

  doPatrol(_delta: number) {}

  doPanic(_delta: number) {
    this.panicIndicator.setVisible(true);
    this.targetBell = this.getClosestObject(this.parentScene.level.alarms.getChildren() as Phaser.GameObjects.Sprite[]);
    this.setPathTo(this.targetBell, () => {
      this.speed *= this.PANIC_SPEED_MULTIPLIER;
      this.currentState = PeasantState.HEAD_TOWARDS_BELL;
    });

    if (!this.panicSoundPlayed) {
      const panicSound = Phaser.Math.Between(0, this.parentScene.panicSounds.length - 1);
      this.parentScene.sound.play(this.parentScene.panicSounds[panicSound], this.getSoundParams());
      this.panicSoundPlayed = true;
    }
  }

  doRingBell(_delta: number) {
    this.panicIndicator.setVisible(false);
    eventManager.emit(Events.BELL_RUNG, this.parentScene, {});
    this.currentState = PeasantState.IDLE;
  }

  doNeedABreak(_delta: number) {
    this.targetBush = this.getRandomObject(this.parentScene.level.bushes.getChildren() as Phaser.GameObjects.Sprite[]);
    this.setPathTo(this.targetBush, () => {
      this.positionBeforeTinkle = { x: this.x, y: this.y };
      this.currentState = PeasantState.HEAD_TOWARDS_BUSH;
    });
  }

  doTinkle(delta: number) {
    this.tinkleTimer -= delta;
    this.LOS_DISTANCE = this.TINKLE_LOS_DISTANCE;
    if (this.tinkleTimer < 0) {
      this.currentState = PeasantState.TINKLE_DONE;
      this.resetTinkleTimer();
      this.LOS_DISTANCE = this.NORMAL_LOS_DISTANCE;
    }
  }

  doTinkleDone(_delta: number) {
    this.setPathTo(this.positionBeforeTinkle, () => {
      this.currentState = PeasantState.HEAD_BACK_TO_PARTY;
    });
  }

  die() {
    this.panicIndicator.setVisible(false);
    this.parentScene.peasants.remove(this);
    const location = this.body.position;
    const gender = this.gender;
    this.destroy();
    eventManager.emit(Events.PEASANT_KILLED, this.parentScene, { location, gender });
  }

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
