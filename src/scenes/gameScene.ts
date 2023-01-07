import { CameraTarget } from "./game/cameraTarget";
import { LevelManager } from "./game/levelManager";
import { Peasant } from "./game/peasant";
import { Player } from "./game/player";

export class GameScene extends Phaser.Scene {
  cameraTarget!: CameraTarget;
  player!: Player;
  level!: LevelManager;
  peasants!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("colorcube", "assets/images/colorcube.png");
    this.load.image("bush", "assets/images/bush.png");
    this.load.image("hidingplace", "assets/images/hidingplace.png");
    this.load.tilemapTiledJSON("level0", "assets/maps/level0.json");
    this.load.image("tilesheet", "assets/maps/tilesheet.png");
    this.load.audio("music", "assets/audio/Night_1.mp3");
    this.load.spritesheet("player_walking", "assets/images/player/walking.png", {
      frameHeight: 70,
      frameWidth: 54,
    });
    this.load.image("blood", "assets/images/placeholder_blood_splatter.png");
  }

  create() {
    this.cameraTarget = new CameraTarget(this, 0, 0);
    this.add.existing(this.cameraTarget);
    this.peasants = this.add.group({ name: "Peasants" });

    for (let i = 0; i < 50; i++) {
      const peasant = new Peasant(this, 500 + i, 500 + i);
      this.peasants.add(peasant);
      this.add.existing(peasant);
      this.physics.world.enable(peasant);
      peasant.create();
    }

    this.player = new Player(this, 700, 700, this.cameraTarget);
    this.player = this.add.existing(this.player);
    this.physics.world.enable(this.player);
    this.player.create();

    this.level = new LevelManager(this);
    this.add.existing(this.level);

    this.physics.add.collider(this.player, this.level.buildingLayer);
    this.physics.add.collider(this.peasants, this.level.buildingLayer);
    this.physics.add.collider(this.peasants, this.player);
    this.physics.add.collider(this.peasants, this.peasants);

    this.cameras.main.startFollow(this.cameraTarget, true, 0.05, 0.05);
    this.cameras.main.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.physics.world.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.sound.add("music");
    this.sound.play("music", { loop: true });
  }

  update(time: number, delta: number) {
    this.player.update(delta);
    this.peasants.children.each((peasant) => peasant.update(time, delta));
  }
}

export const TILE_SIZE = 64;
