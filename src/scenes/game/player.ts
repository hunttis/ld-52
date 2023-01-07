import { GameScene, TILE_SIZE } from "../gameScene";
import { CameraTarget } from "./cameraTarget";
import { EVENTS, eventsManager } from "./eventsManager";
import { Peasant } from "./peasant";

export class Player extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  cameraTarget: CameraTarget;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  controllable: boolean = true;

  SPEED: number = 30;
  KILL_RANGE: number = 32;
  POUNCE_RANGE: number = 200;
  POUNCE_SPEED: number = 500;

  nearestPeasantDistance: number = 100000;
  nearestPeasant!: Peasant;

  constructor(
    gameScene: GameScene,
    xLoc: number,
    yLoc: number,
    cameraTarget: CameraTarget
  ) {
    super(gameScene, xLoc, yLoc, "null");
    this.name = "Player";
    this.parentScene = gameScene;
    this.cursors = this.parentScene.input.keyboard.createCursorKeys();
    this.cameraTarget = cameraTarget;
    this.anims.create({
      key: "player_walking",
      frames: "player_walking",
      frameRate: 60,
      repeat: -1,
    });
  }

  create() {
    this.setSize(TILE_SIZE, TILE_SIZE);
    this.refreshBody();
    this.setCollideWorldBounds(true);
    var attackKey = this.parentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    attackKey.on("down", () => {
      this.attackNearest();
    });
    this.anims.play("player_walking");
  }

  update(delta: number) {
    if (this.controllable) {
      if (this.cursors.left.isDown) {
        this.setVelocityX(-this.SPEED * delta);
      } else if (this.cursors.right.isDown) {
        this.setVelocityX(this.SPEED * delta);
      } else {
        this.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.setVelocityY(-this.SPEED * delta);
      } else if (this.cursors.down.isDown) {
        this.setVelocityY(this.SPEED * delta);
      } else {
        this.setVelocityY(0);
      }
    }

    this.cameraTarget.setPosition(
      this.x + this.body.velocity.x / 2,
      this.y + this.body.velocity.y / 2
    );

    this.parentScene.peasants.children.each((peasant) => {
      const distance = Phaser.Math.Distance.BetweenPoints(
        this,
        peasant.body.position
      );

      if (this.nearestPeasant === (peasant as Peasant)) {
        this.nearestPeasantDistance = distance;
      } else if (
        !this.nearestPeasant ||
        distance < this.nearestPeasantDistance
      ) {
        this.nearestPeasant = peasant as Peasant;
        this.nearestPeasantDistance = distance;
      }
    });

    if (this.nearestPeasantDistance < 150) {
      eventsManager.emit(EVENTS.KILL_NEAR);
    }

    if (!this.controllable) {
      this.parentScene.physics.moveToObject(
        this,
        this.nearestPeasant,
        this.POUNCE_SPEED
      );

      if (
        Phaser.Math.Distance.BetweenPoints(
          this,
          this.nearestPeasant.body.position
        ) < this.KILL_RANGE
      ) {
        this.controllable = true;
        const killPosition = new Phaser.Math.Vector2(
          this.nearestPeasant.body.position.x,
          this.nearestPeasant.body.position.y
        );
        eventsManager.emit(EVENTS.PEASANT_KILLED, killPosition);
        this.parentScene.peasants.remove(this.nearestPeasant);
        this.nearestPeasant.destroy();
        this.nearestPeasantDistance = 100000;
        console.log("KILL");
      }
    }
  }

  attackNearest() {
    if (!this.nearestPeasant) {
      return;
    }
    if (this.nearestPeasantDistance < this.POUNCE_RANGE) {
      this.controllable = false;
      console.log("Going for the kill!");
    }
  }
}
