import {GameOverReason} from "src/scenes/game/eventsManager";
import {GameScene} from "src/scenes/gameScene";

export class GameOverScene extends Phaser.Scene {
    titleText!: Phaser.GameObjects.Text;
    instructionsText!: Phaser.GameObjects.Text;
    startText!: Phaser.GameObjects.Text;
    gameOverReason!: GameOverReason;

    bloodFx!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super({key: "GameOverScene"});
    }

    preload() {
    }

    init(data: { gameOverReason: GameOverReason }) {
        this.gameOverReason = data.gameOverReason
    }

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

        this.titleText = this.createStyledText("The Feast is over...", horizontalCenter, 100, titleStyle);
        this.instructionsText = this.createStyledText(
            this.gameOverReason === "cleric"
                ? "You died, killed by the clerics"
                : "The villagers sounded the alarm and hunted you down with the clerics",
            horizontalCenter,
            350,
            instructionStyle
        );
        this.startText = this.createStyledText(
            "Go to main menu by pressing enter",
            horizontalCenter,
            600,
            instructionStyle
        );

        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        spaceKey.on("down", () => this.startGame());
        this.sound.play("menumusic", {loop: true, volume: 0.1});
    }

    createStyledText(text: string, xLoc: number, yLoc: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
        const newTextItem = this.add.text(xLoc, yLoc, text, style);
        newTextItem.setPosition(xLoc, yLoc);
        newTextItem.setOrigin(0.5);
        return newTextItem;
    }

    update(_time: number, _delta: number) {
    }

    startGame() {
        this.sound.stopAll();
        this.scene.start("MenuScene");
    }
}
