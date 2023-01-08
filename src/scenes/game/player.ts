import { GameScene, TILE_SIZE } from "../gameScene";
import { CameraTarget } from "./cameraTarget";
import { Events, eventManager } from "./eventsManager";
import { Peasant } from "./peasant";

export class Player extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  cameraTarget: CameraTarget;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  controllable: boolean = true;
  canPounce: boolean = true;
  arrow!: Phaser.GameObjects.Sprite;
  shadow!: Phaser.GameObjects.Sprite;

  SPEED: number = 30;
  KILL_RANGE: number = 32;
  POUNCE_RANGE: number = 200;
  POUNCE_SPEED: number = 500;
  POUNCE_COOLDOWN: number = 1_000;
  GROWL_COOLDOWN: number = 5_000;

  growlCooldownTimer: number = this.GROWL_COOLDOWN;
  nearestPeasantDistance: number = 100000;
  nearestPeasant?: Peasant;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number, cameraTarget: CameraTarget) {
    super(gameScene, xLoc, yLoc, "null");
    this.name = "Player";
    this.parentScene = gameScene;
    this.cursors = this.parentScene.input.keyboard.createCursorKeys();
    this.cameraTarget = cameraTarget;
    this.cameraTarget.visible = false;
    this.anims.create({
      key: "player_front_idle",
      frames: "player_front_idle",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "player_front_walk",
      frames: "player_front_walk",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "player_back_walk",
      frames: "player_back_walk",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "player_side_walk",
      frames: "player_side_walk",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "player_side_idle",
      frames: "player_side_idle",
      frameRate: 60,
      repeat: -1,
    });
    this.setDepth(10);
  }

  create() {
    this.body.setOffset(TILE_SIZE * 0.1, TILE_SIZE * 0.25);
    this.body.setCircle(TILE_SIZE * 0.4);
    this.refreshBody();
    this.setCollideWorldBounds(true);
    const attackKey = this.parentScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    attackKey.on("down", () => {
      this.attackNearest();
    });
    this.anims.play("player_front_idle");
    this.arrow = this.parentScene.add.sprite(this.x, this.y, "arrow");
    this.arrow.setOrigin(0, 0.5);
    this.shadow = this.parentScene.add.sprite(this.x, this.y + 32, "shadow");
    this.shadow.setOrigin(0.5);
    this.shadow.setScale(0.5, 1);
  }

  update(delta: number) {
    if (this.parentScene.gameOver) {
      this.stop();
      this.body.stop();
      return;
    }

    let direction = "none";
    let isMoving = false;
    if (this.controllable) {
      if (this.cursors.left.isDown) {
        this.setVelocityX(-this.SPEED * delta);
        this.anims.play("player_side_walk", true);
        this.flipX = true;
        isMoving = true;
        direction = "left";
      } else if (this.cursors.right.isDown) {
        this.setVelocityX(this.SPEED * delta);
        this.anims.play("player_side_walk", true);
        this.flipX = false;
        isMoving = true;
        direction = "right";
      } else {
        this.setVelocityX(0);
      }

      let animation = "player_back_walk";
      if (this.cursors.up.isDown) {
        if (isMoving) {
          animation = "player_side_walk";
        }
        this.setVelocityY(-this.SPEED * delta);
        this.anims.play(animation, true);
        isMoving = true;
      } else if (this.cursors.down.isDown) {
        animation = "player_front_walk";
        if (isMoving) {
          animation = "player_side_walk";
        }
        this.setVelocityY(this.SPEED * delta);
        this.anims.play(animation, true);
        isMoving = true;
      } else {
        this.setVelocityY(0);
      }

      if (!isMoving) {
        this.anims.play("player_front_idle", true);
      }
    }

    this.cameraTarget.setPosition(this.x + this.body.velocity.x / 2, this.y + this.body.velocity.y / 2);

    this.parentScene.peasants.children.each((peasant) => {
      const distance = Phaser.Math.Distance.BetweenPoints(this, peasant.body.position);

      if (this.nearestPeasant === (peasant as Peasant)) {
        this.nearestPeasantDistance = distance;
      } else if (!this.nearestPeasant || distance < this.nearestPeasantDistance) {
        this.nearestPeasant = peasant as Peasant;
        this.nearestPeasantDistance = distance;
      }
    });

    if (this.nearestPeasantDistance < this.POUNCE_RANGE) {
      eventManager.emit(Events.KILL_NEAR, this.parentScene, {});
    }

    if (this.nearestPeasant && this.nearestPeasantDistance < this.POUNCE_RANGE) {
      // show arrow + turn towards
      this.arrow.setVisible(true);
      this.arrow.setPosition(this.x, this.y);
      this.arrow.rotation = Phaser.Math.Angle.BetweenPoints(this.arrow, this.nearestPeasant);
      if (this.growlCooldownTimer < 0) {
        this.growlCooldownTimer = this.GROWL_COOLDOWN;
        this.parentScene.sound.play("growl", { volume: 0.5 });
      }
    } else {
      this.arrow.setVisible(false);
    }
    this.growlCooldownTimer -= delta;

    if (!this.controllable && this.nearestPeasant) {
      this.parentScene.physics.moveToObject(this, this.nearestPeasant, this.POUNCE_SPEED);

      if (Phaser.Math.Distance.BetweenPoints(this, this.nearestPeasant) < this.KILL_RANGE) {
        this.controllable = true;
        this.nearestPeasant.die();
        this.nearestPeasant = undefined;
        this.nearestPeasantDistance = Infinity;
        if (Math.random() > 0.5) {
          this.parentScene.sound.play("chomp1");
        } else {
          this.parentScene.sound.play("chomp2");
        }
        setTimeout(() => (this.canPounce = true), this.POUNCE_COOLDOWN);
      }
    }
    this.shadow.setPosition(this.body.center.x, this.body.center.y + 24);
  }

  attackNearest() {
    if (!this.nearestPeasant || !this.canPounce) return;
    if (this.nearestPeasantDistance < this.POUNCE_RANGE) {
      this.controllable = false;
      this.canPounce = false;
      setTimeout(() => (this.controllable = true), this.POUNCE_COOLDOWN);
    }
  }
}
