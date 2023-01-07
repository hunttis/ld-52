export class MenuScene extends Phaser.Scene {
  titleText!: Phaser.GameObjects.Text;
  instructionsText!: Phaser.GameObjects.Text;
  startText!: Phaser.GameObjects.Text;

  bloodFx!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {}

  create() {
    const horizontalCenter = this.cameras.main.width / 2;
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

    this.titleText = this.createStyledText("The Feast of Gévaudan", horizontalCenter, 100, titleStyle);
    this.instructionsText = this.createStyledText(
      "Arrow keys to control, space to attack when near peasant",
      horizontalCenter,
      350,
      instructionStyle
    );
    this.startText = this.createStyledText("Start by pressing spacebar", horizontalCenter, 600, instructionStyle);

    var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on("down", () => this.startGame());
  }

  createStyledText(text: string, xLoc: number, yLoc: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const newTextItem = this.add.text(xLoc, yLoc, text, style);
    newTextItem.setPosition(xLoc, yLoc);
    newTextItem.setOrigin(0.5);
    return newTextItem;
  }

  update(time: number, delta: number) {}

  startGame() {
    this.scene.start("GameScene");
  }
}
