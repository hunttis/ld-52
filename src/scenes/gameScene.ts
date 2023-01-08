import { CameraTarget } from "./game/cameraTarget";
import { eventManager, Events } from "./game/eventsManager";
import { LevelManager } from "./game/levelManager";
import { Peasant } from "./game/peasant";
import { Player } from "./game/player";

import "./game/deadPeasant";
import { Ui } from "./game/ui";
import { Guard } from "./game/guard";

export const TILE_SIZE = 64;

export class GameScene extends Phaser.Scene {
  cameraTarget!: CameraTarget;
  player!: Player;
  level!: LevelManager;
  peasants!: Phaser.GameObjects.Group;
  guards!: Phaser.GameObjects.Group;
  ui!: Ui;
  debugGraphics!: Phaser.GameObjects.Graphics;

  happySounds: string[] = [];
  bushSounds: string[] = [];
  panicSounds: string[] = [];
  angrySounds: string[] = [];
  bellRinging: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  loadAudio(key: string, filename: string, group?: string[]) {
    this.load.audio(key, [
      `assets/audio/${filename}.mp3`,
      `assets/audio/${filename}.ogg`,
      `assets/audio/${filename}.wav`,
    ]);
    if (group) {
      group.push(key);
    }
  }

  preload() {
    this.load.image("colorcube", "assets/images/colorcube.png");
    this.load.image("bush", "assets/images/bush.png");
    this.load.image("hidingplace", "assets/images/hidingplace.png");
    this.load.tilemapTiledJSON("level0", "assets/maps/level0.json");
    this.load.image("tilesheet", "assets/maps/tilesheet.png");
    this.load.audio("music", "assets/audio/Night_1.mp3");
    this.loadAudio("chomp1", "lokichomp1");
    this.loadAudio("chomp2", "lokichomp2");
    this.loadAudio("growl", "zeldagrowl");
    this.loadAudio("bell_ring", "alarmbell");
    // Panic sounds
    this.loadAudio("aaahhh", "aaahhh", this.panicSounds);
    this.loadAudio("aahh", "aahh", this.panicSounds);
    this.loadAudio("ahh", "ahh", this.panicSounds);
    this.loadAudio("ohmygod", "ohmygod", this.panicSounds);
    this.loadAudio("youwontcatchme", "youwontcatchme", this.panicSounds);
    this.loadAudio("whatisthat", "whatisthat", this.panicSounds);
    this.loadAudio("pleasedonthitme", "pleasedonthitme", this.panicSounds);
    this.loadAudio("ohlordinheaven", "ohlordinheaven", this.panicSounds);
    // Angry sounds
    this.loadAudio("begonefoulbeast", "begonefoulbeast", this.angrySounds);
    // Bush sounds
    this.loadAudio("needtogo", "needtogo", this.bushSounds);
    this.loadAudio("excuseme", "excuseme", this.bushSounds);
    this.loadAudio("needtoleak", "needtoleak", this.bushSounds);
    this.loadAudio("needtopee", "needtopee", this.bushSounds);
    this.loadAudio("sorryguys", "sorryguys", this.bushSounds);
    // Happy sounds
    this.loadAudio("moredrinks", "moredrinks", this.happySounds);
    this.loadAudio("oujee", "oujee", this.happySounds);
    this.loadAudio("wohoo", "wohoo", this.happySounds);
    this.loadAudio("hahamightyfeast", "hahamightyfeast", this.happySounds);
    this.loadAudio("hehehe", "hehehe", this.happySounds);
    this.loadAudio("hey", "hey", this.angrySounds);
    this.loadAudio("huhhee", "huhhee", this.happySounds);
    this.loadAudio("jeei", "jeei", this.happySounds);
    this.loadAudio("letshaveanother", "letshaveanother", this.happySounds);

    this.load.spritesheet("player_front_idle", "assets/images/player/front_idle_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("player_front_walk", "assets/images/player/front_walk_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("player_side_idle", "assets/images/player/side_idle_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("player_side_walk", "assets/images/player/side_walk_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_man_walk", "assets/images/peasant/man_walk_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_man_death", "assets/images/peasant/man_death_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_man_idle", "assets/images/peasant/man_idle_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_man_party", "assets/images/peasant/man_party_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_woman_walk", "assets/images/peasant/woman_walk_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_woman_death", "assets/images/peasant/woman_death_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_woman_idle", "assets/images/peasant/woman_idle_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.spritesheet("peasant_woman_party", "assets/images/peasant/woman_party_64x64.png", {
      frameHeight: 64,
      frameWidth: 64,
    });
    this.load.image("shadow", "assets/images/player/shadow.png");
    this.load.image("blood", "assets/images/placeholder_blood_splatter.png");
    this.load.image("arrow", "assets/images/arrow.png");
    this.load.image("peasant_panic", "assets/images/peasant_alert.png");
  }

  initDebugKeys() {
    // init keys
    const pressEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const gotoMenu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const makePeasantPanic = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // init handlers
    pressEsc.on("down", () => {
      this.sound.stopAll();
      eventManager.emit(Events.GAME_OVER, this, {});
    });

    gotoMenu.on("down", () => {
      this.sound.stopAll();
      this.scene.start("MenuScene");
    });

    makePeasantPanic.on("down", () => {
      (this.peasants.getChildren()[0] as Peasant).doPanic(0);
    });
  }

  create() {
    const muteButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    muteButton.on("down", () => (this.sound.mute = !this.sound.mute));

    this.initDebugKeys();
    this.debugGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0x5500ff } });
    this.cameraTarget = new CameraTarget(this, 0, 0);
    this.add.existing(this.cameraTarget);
    this.peasants = this.add.group({ name: "Peasants" });
    this.guards = this.add.group({ name: "Guards" });

    this.player = new Player(this, 700, 700, this.cameraTarget);
    this.player = this.add.existing(this.player);
    this.physics.world.enable(this.player);
    this.player.create();

    this.level = new LevelManager(this);
    this.add.existing(this.level);

    this.physics.add.collider(this.player, this.level.buildingLayer);
    this.physics.add.collider(this.peasants, this.level.buildingLayer);
    this.physics.add.collider(this.guards, this.level.buildingLayer);
    this.physics.add.overlap(this.peasants, this.player);
    // Remove if people tend to get stuck
    // this.physics.add.collider(this.peasants, this.peasants);
    this.physics.add.collider(this.guards, this.peasants);
    this.physics.add.collider(this.guards, this.guards);

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.physics.world.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.sound.add("music");
    this.sound.play("music", { loop: true, volume: 0.3 });

    for (let i = 0; i < 2; i++) {
      const peasant = new Peasant(this, 500 + i, 500 + i);
      this.peasants.add(peasant);
      this.add.existing(peasant);
      this.physics.world.enable(peasant);
      peasant.create();
    }

    for (let i = 0; i < 1; i++) {
      const guard = new Guard(this, 1600 + i, 600 + i);
      this.guards.add(guard);
      this.add.existing(guard);
      this.physics.world.enable(guard);
      guard.create();
    }

    eventManager.on(Events.GAME_OVER, () => {
      this.sound.stopAll();
      this.scene.start("GameOverScene");
    });

    eventManager.on(Events.GAME_WON, () => {
      this.sound.stopAll();
      this.scene.start("GameWinScene");
    });

    eventManager.on(Events.PEASANT_KILLED, (game) => {
      if (game.peasants.countActive() === 0) eventManager.emit(Events.GAME_WON, game, {});
    });

    eventManager.on(Events.BELL_RUNG, (_game) => {
      if (!this.bellRinging) {
        this.sound.play("bell_ring");
        this.bellRinging = true;
        this.player.gameOver = true;
      }

      setTimeout(() => eventManager.emit(Events.GAME_OVER, this, {}), 5 * 1000);
    });

    this.ui = new Ui(this);
  }

  update(time: number, delta: number) {
    this.player.update(delta);
    this.peasants.children.each((peasant) => peasant.update(time, delta));
    this.guards.children.each((guard) => guard.update());
    this.ui.update(delta);
  }
}
