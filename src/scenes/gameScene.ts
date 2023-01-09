import { CameraTarget } from "./game/cameraTarget";
import { eventManager, Events } from "./game/eventsManager";
import { LevelManager } from "./game/levelManager";
import { Peasant } from "./game/peasant";
import { Player } from "./game/player";
import { Ui } from "./game/ui";

import "./game/deadPeasant";
import "./game/guard";

const { Vector2 } = Phaser.Math;

export const TILE_SIZE = 64;

export class GameScene extends Phaser.Scene {
  cameraTarget!: CameraTarget;
  player!: Player;
  level!: LevelManager;
  peasants!: Phaser.GameObjects.Group;
  guards!: Phaser.GameObjects.Group;
  ui!: Ui;
  debugGraphics!: Phaser.GameObjects.Graphics;
  gameOver = false;

  happySounds: string[] = [];
  tinkleMingleSounds: string[] = [];
  bushSounds: string[] = [];
  panicSounds: string[] = [];
  angrySounds: string[] = [];
  deathSounds: string[] = [];

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
    this.load.image("bush", "assets/images/bush-small.png");
    this.load.image("hidingplace", "assets/images/hidingplace.png");
    this.load.tilemapTiledJSON("level0", "assets/maps/level0.json");
    this.load.image("tilesheet", "assets/maps/tilesheet.png");
    this.load.image("bell", "assets/images/bell.png");

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
    this.loadAudio("helphelp", "helphelp", this.panicSounds);
    this.loadAudio("haaaahh", "haaaahh", this.panicSounds);
    this.loadAudio("rraaaa", "rraaaa", this.panicSounds);
    this.loadAudio("hhrraaa", "hhrraaa", this.panicSounds);
    this.loadAudio("huh-aargh", "huh-aargh", this.panicSounds);
    // Angry sounds
    this.loadAudio("begonefoulbeast", "begonefoulbeast", this.angrySounds);
    this.loadAudio("hey", "hey", this.angrySounds);
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
    this.loadAudio("huhhee", "huhhee", this.happySounds);
    this.loadAudio("jeei", "jeei", this.happySounds);
    this.loadAudio("letshaveanother", "letshaveanother", this.happySounds);
    this.loadAudio("yippee-woo", "yippee-woo", this.happySounds);
    this.loadAudio("wuhhuu-yeah", "wuhhuu-yeah", this.happySounds);
    this.loadAudio("niceshirt", "niceshirt", this.happySounds);
    this.loadAudio("itspartytime", "itspartytime", this.happySounds);
    this.loadAudio("bestpartyevarr", "bestpartyevarr", this.happySounds);
    this.loadAudio("lookatthesemoves", "lookatthesemoves", this.happySounds);
    this.loadAudio("imgonnadance", "imgonnadance", this.happySounds);
    // Tinkle Mingle
    this.loadAudio("heyheydidyouhear", "heyheydidyouhear", this.tinkleMingleSounds);
    this.loadAudio("didyouseethatguard", "didyouseethatguard", this.tinkleMingleSounds);
    this.loadAudio("werewolfstories", "werewolfstories", this.tinkleMingleSounds);
    this.loadAudio("bobbybrewers", "bobbybrewers", this.tinkleMingleSounds);
    this.loadAudio("iheardthisyear", "iheardthisyear", this.tinkleMingleSounds);
    this.loadAudio("mingle1", "mingle1", this.tinkleMingleSounds);
    this.loadAudio("mingle2", "mingle2", this.tinkleMingleSounds);
    this.loadAudio("mingle3", "mingle3", this.tinkleMingleSounds);
    this.loadAudio("mingle4", "mingle4", this.tinkleMingleSounds);
    // Death Sounds
    this.loadAudio("urgh", "urgh", this.deathSounds);
    this.loadAudio("aarrgghh", "aarrgghh", this.deathSounds);
    this.loadAudio("argh1", "argh1", this.deathSounds);
    this.loadAudio("haargh", "haargh", this.deathSounds);
    this.loadAudio("hngg-argh", "hngg-argh", this.deathSounds);
    this.loadAudio("death1", "death1", this.deathSounds);
    this.loadAudio("death2", "death2", this.deathSounds);
    this.loadAudio("death3", "death3", this.deathSounds);
    this.loadAudio("death4", "death4", this.deathSounds);

    const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = { frameHeight: 64, frameWidth: 64 };

    this.load.spritesheet("player_front_idle", "assets/images/player/front_idle_64x64.png", frameConfig);
    this.load.spritesheet("player_front_walk", "assets/images/player/front_walk_64x64.png", frameConfig);
    this.load.spritesheet("player_back_idle", "assets/images/player/back_idle_64x64.png", frameConfig);
    this.load.spritesheet("player_back_walk", "assets/images/player/back_walk_64x64.png", frameConfig);
    this.load.spritesheet("player_death", "assets/images/player/wolf_death_64x64_3s.png", frameConfig);

    this.load.spritesheet("player_side_idle", "assets/images/player/side_idle_64x64.png", frameConfig);
    this.load.spritesheet("player_side_walk", "assets/images/player/side_walk_64x64.png", frameConfig);
    this.load.spritesheet("peasant_man_walk", "assets/images/peasant/man_walk_64x64.png", frameConfig);
    this.load.spritesheet("peasant_man_death", "assets/images/peasant/man_death_64x64.png", frameConfig);
    this.load.spritesheet("peasant_man_idle", "assets/images/peasant/man_idle_64x64.png", frameConfig);
    this.load.spritesheet("peasant_man_party", "assets/images/peasant/man_party_64x64.png", frameConfig);
    this.load.spritesheet("peasant_woman_walk", "assets/images/peasant/woman_walk_64x64.png", frameConfig);
    this.load.spritesheet("peasant_woman_death", "assets/images/peasant/woman_death_64x64.png", frameConfig);
    this.load.spritesheet("peasant_woman_idle", "assets/images/peasant/woman_idle_64x64.png", frameConfig);
    this.load.spritesheet("peasant_woman_party", "assets/images/peasant/woman_party_64x64.png", frameConfig);
    this.load.spritesheet("guard_idle", "assets/images/guard_idle_64x64.png", frameConfig);
    this.load.spritesheet("guard_move", "assets/images/guard_move_64x64.png", frameConfig);
    this.load.spritesheet("guard_wave", "assets/images/guard_wave_64x64.png", frameConfig);
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
    const playSound = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

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

    playSound.on("down", () => {
      const sounds = this.happySounds;
      const sound = sounds[Phaser.Math.Between(0, sounds.length - 1)];
      this.sound.play(sound);
    });
  }

  create() {
    this.gameOver = false;
    this.bellRinging = false;
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
    this.physics.add.collider(this.peasants, this.peasants);
    this.physics.add.collider(this.guards, this.peasants);
    this.physics.add.collider(this.guards, this.guards);

    this.cameras.main.startFollow(this.cameraTarget, true, 0.04, 0.04);
    this.cameras.main.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.physics.world.setBounds(0, 0, this.level.getWidth(), this.level.getHeight());
    this.sound.add("music");
    this.sound.play("music", { loop: true, volume: 0.1 });

    for (let i = 0; i < 5; i++) {
      const guardSpawn = this.level.buildingLayer.getTileAt(58, 32, true);
      eventManager.emit(Events.SPAWN_GUARD, this, {
        location: new Vector2(guardSpawn.getCenterX(), guardSpawn.getCenterY()),
      });
    }

    eventManager.on(Events.GAME_OVER, (_game, gameOverReason) => {
      if (this.gameOver) return;
      this.gameOver = true;
      setTimeout(() => {
        this.sound.stopAll();
        this.scene.start("GameOverScene", gameOverReason);
      }, 5_000);
    });

    eventManager.on(Events.GAME_WON, () => {
      this.sound.stopAll();
      this.scene.start("GameWinScene");
    });

    eventManager.on(Events.PEASANT_KILLED, (game) => {
      if (game.peasants.countActive() === 0) eventManager.emit(Events.GAME_WON, game, {});
    });

    eventManager.on(Events.BELL_RUNG, (_game) => {
      console.log(this.bellRinging)
      if (!this.bellRinging) {
        this.sound.play("bell_ring", {volume: 1.5});
        this.bellRinging = true;
      }
      eventManager.emit(Events.GAME_OVER, this, {reason: "bell"});
    });

    this.ui = new Ui(this);
  }

  update(time: number, delta: number) {
    this.player.update(delta);
    this.peasants.children.each((peasant) => peasant.update(time, delta));
    this.guards.children.each((guard) => guard.update());
    this.ui.update(delta);
    this.level.update(delta);
  }
}
