import { GameScene } from "../gameScene";
import * as EasyStar from "easystarjs";
import { Peasant } from "./peasant";
import { eventManager, Events } from "./eventsManager";

export enum LayerName {
  BUILDINGS = "buildings",
  BUSHES = "bushes",
  HIDING_PLACES = "hidingplaces",
  GROUND = "ground",
  ALARM = "alarm",
  PEASANT = "peasants",
}

export enum SpriteName {
  BUSH = "bush",
  HIDING_PLACE = "hidingplace",
  ALARM_BELL = "bell",
}

export class LevelManager extends Phaser.GameObjects.Group {
  parentScene: GameScene;
  groundLayer: Phaser.Tilemaps.TilemapLayer;
  buildingLayer: Phaser.Tilemaps.TilemapLayer;
  alarms!: Phaser.GameObjects.Group;
  bushes!: Phaser.GameObjects.Group;
  hidingPlaces!: Phaser.GameObjects.Group;
  easyStar: EasyStar.js;

  static readonly GUARD_SPAWN_TIMER_MAX: number = 30_000;
  guardSpawnTimer: number = 0;

  constructor(parent: GameScene) {
    super(parent);
    this.parentScene = parent;
    this.bushes = new Phaser.GameObjects.Group(this.parentScene);
    this.hidingPlaces = new Phaser.GameObjects.Group(this.parentScene);
    this.alarms = new Phaser.GameObjects.Group(this.parentScene);
    this.easyStar = new EasyStar.js();

    const map = this.parentScene.make.tilemap({ key: "level0" });
    map.addTilesetImage("tilesheet", "tilesheet");

    this.groundLayer = map.createLayer(LayerName.GROUND, "tilesheet", 0, 0);
    this.groundLayer.depth = -1;

    this.buildingLayer = map.createLayer(LayerName.BUILDINGS, "tilesheet", 0, 0);

    this.buildingLayer.setCollisionBetween(1, 999);
    this.buildingLayer.setVisible(true);

    this.createMapSprites(map);
    this.configEasyStar();
  }

  createMapSprites(map: Phaser.Tilemaps.Tilemap) {
    map.objects.forEach((layer: Phaser.Tilemaps.ObjectLayer) => {
      if (layer.name === LayerName.BUSHES) {
        layer.objects.forEach((obj) => {
          if (obj.x && obj.y) {
            const bush = this.parentScene.add.sprite(obj.x, obj.y, SpriteName.BUSH);
            this.bushes.add(bush);
          }
        });
      } else if (layer.name === LayerName.HIDING_PLACES) {
        layer.objects.forEach((obj) => {
          if (obj.x && obj.y) {
            const hidingPlace = this.parentScene.add.sprite(obj.x, obj.y, SpriteName.HIDING_PLACE);
            this.hidingPlaces.add(hidingPlace);
          }
        });
      } else if (layer.name === LayerName.ALARM) {
        layer.objects.forEach((obj) => {
          if (obj.x && obj.y) {
            const alarmBell = this.parentScene.add.sprite(obj.x, obj.y, SpriteName.ALARM_BELL);
            alarmBell.setScale(0.5);
            this.alarms.add(alarmBell);
          }
        });
      } else if (layer.name === LayerName.PEASANT) {
        layer.objects.forEach((obj) => {
          const peasant = new Peasant(this.parentScene, obj.x ?? 0, obj.y ?? 0);
          this.parentScene.peasants.add(peasant);
          this.parentScene.add.existing(peasant);
          this.parentScene.physics.world.enable(peasant);
          peasant.create();
        });
      }
    });
  }

  /** Call after placing everything on buildingLayer */
  configEasyStar() {
    this.easyStar.enableDiagonals();
    this.easyStar.setAcceptableTiles([-1]);
    this.easyStar.setGrid(this.buildingLayer.layer.data.map((col) => col.map((row) => row.index)));
  }

  findPathTo() {}

  create() {
    console.log("Creating!");
  }

  update(delta: number) {
    this.guardSpawnTimer += delta;
    if (this.guardSpawnTimer > LevelManager.GUARD_SPAWN_TIMER_MAX) {
      this.guardSpawnTimer -= LevelManager.GUARD_SPAWN_TIMER_MAX;
      const guardSpawnTile = this.buildingLayer.getTileAt(58, 32, true);
      eventManager.emit(Events.SPAWN_GUARD, this.parentScene, {
        location: new Phaser.Math.Vector2(guardSpawnTile.getCenterX(), guardSpawnTile.getCenterY()),
      });
    }
  }

  getWidth() {
    return this.buildingLayer.width;
  }

  getHeight() {
    return this.buildingLayer.height;
  }
}
