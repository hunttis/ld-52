export class GameWinScene extends Phaser.Scene {
  titleText!: Phaser.GameObjects.Text;
  instructionsText!: Phaser.GameObjects.Text;
  startText!: Phaser.GameObjects.Text;

  bloodFx!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "GameWinScene" });
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

    this.titleText = this.createStyledText("Delicious...", horizontalCenter, 100, titleStyle);
    this.createStyledText("You ate all the peasants.", horizontalCenter, 350, instructionStyle);
    this.createStyledText("You can only hope this ends your curse.", horizontalCenter, 450, instructionStyle);
    this.createStyledText("Thanks for playing!", horizontalCenter, 550, instructionStyle);

    this.startText = this.createStyledText(
      "Go to main menu by pressing enter",
      horizontalCenter,
      630,
      instructionStyle
    );

    var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    spaceKey.on("down", () => this.startGame());
    this.sound.play("menumusic", { loop: true, volume: 0.1 });
  }

  createStyledText(text: string, xLoc: number, yLoc: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const newTextItem = this.add.text(xLoc, yLoc, text, style);
    newTextItem.setPosition(xLoc, yLoc);
    newTextItem.setOrigin(0.5);
    return newTextItem;
  }

  update(_time: number, _delta: number) {}

  startGame() {
    this.sound.stopAll();
    this.scene.start("MenuScene");
  }
}
