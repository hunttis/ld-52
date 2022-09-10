export class GameScene extends Phaser.Scene {
  player!: Phaser.GameObjects.GameObject;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("player", "assets/images/colorcube.png");
  }

  create() {
    this.add.sprite(300, 300, "player");
  }
}
