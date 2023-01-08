export class MenuScene extends Phaser.Scene {
  titleText!: Phaser.GameObjects.Text;
  instructionsText!: Phaser.GameObjects.Text;
  startText!: Phaser.GameObjects.Text;

  bloodFx!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    this.load.audio("menumusic", "assets/audio/Alku.mp3");
    this.load.image("titleimage", "assets/images/titleimage.jpg");
  }

  create() {
    const titleImage = this.add.image(this.cameras.main.width, this.cameras.main.height, "titleimage");
    titleImage.setOrigin(1, 1);
    titleImage.setScale(0.5);

    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "MedievalSharp",
      fontSize: "110px",
      stroke: "#c20000",
      strokeThickness: 16,
    };
    const instructionStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "MedievalSharp",
      fontSize: "32px",
    };

    this.startText = this.createStyledText(
      "Peasants have cursed you.\nHarvest the peasants.\n\nWatch out for the clerics.\nthey will kill you.",
      50,
      250,
      instructionStyle
    );

    this.titleText = this.createStyledText("The Feast of Gévaudan", 50, 50, titleStyle);
    this.instructionsText = this.createStyledText(
      "Arrow keys to control\n\nSpace to attack\nwhen near peasant",
      50,
      500,
      instructionStyle
    );
    this.startText = this.createStyledText("Start by pressing enter", 50, 700, instructionStyle);

    var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    spaceKey.on("down", () => this.startGame());
    this.sound.play("menumusic", { loop: true, volume: 0.1 });
  }

  createStyledText(text: string, xLoc: number, yLoc: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const newTextItem = this.add.text(xLoc, yLoc, text, style);
    newTextItem.setPosition(xLoc, yLoc);
    newTextItem.setOrigin(0);
    return newTextItem;
  }

  update(_time: number, _delta: number) {}

  startGame() {
    this.sound.stopAll();
    this.scene.start("GameScene");
  }
}
