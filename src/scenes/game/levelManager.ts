import { GameScene } from "../gameScene";
import * as EasyStar from "easystarjs";

export enum LayerName {
  BUILDINGS = "buildings",
  BUSHES = "bushes",
  HIDING_PLACES = "hidingplaces",
  GROUND = "ground",
}

export enum SpriteName {
  BUSH = "bush",
  HIDING_PLACE = "hidingplace",
}

export class LevelManager extends Phaser.GameObjects.Group {
  parentScene: GameScene;
  groundLayer: Phaser.Tilemaps.TilemapLayer;
  buildingLayer: Phaser.Tilemaps.TilemapLayer;
  bushes!: Phaser.GameObjects.Group;
  hidingPlaces!: Phaser.GameObjects.Group;
  easyStar: EasyStar.js;

  constructor(parent: GameScene) {
    super(parent);
    this.parentScene = parent;
    this.bushes = new Phaser.GameObjects.Group(this.parentScene);
    this.hidingPlaces = new Phaser.GameObjects.Group(this.parentScene);
    this.easyStar = new EasyStar.js();

    const map = this.parentScene.make.tilemap({ key: "level0" });
    map.addTilesetImage("tilesheet", "tilesheet");

    this.groundLayer = map.createLayer(LayerName.GROUND, "tilesheet", 0, 0);
    this.groundLayer.depth = -1;

    this.buildingLayer = map.createLayer(LayerName.BUILDINGS, "tilesheet", 0, 0);

    this.buildingLayer.setCollisionBetween(1, 66);
    this.buildingLayer.setVisible(true);

    this.createMapSprites(map);

    this.parentScene.physics.add.collider(this.parentScene.player, this.buildingLayer);

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

  getWidth() {
    return this.buildingLayer.width;
  }

  getHeight() {
    return this.buildingLayer.height;
  }
}
