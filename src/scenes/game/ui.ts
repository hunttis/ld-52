import { GameScene, TILE_SIZE } from "../gameScene";

enum TutorialState {
  SHOWING_TEXT,
  SWAPPING_NEXT_TEXT,
  TRANSITIONING_OUT,
  TRANSITIONING_IN,
  COMPLETE,
  PROCESSING,
}

export class Ui {
  parentScene: GameScene;
  currentTutorialText: string;
  tutorialTexts: string[] = [
    "Looks like the peasants are enjoying the night..",
    "I can pounce [SPACEBAR] when I'm near a peasant",
    "I can't kill the clerics, but they can kill me. Need to avoid them.",
    "Let's see if I can change the tune of the evening..",
    "I cannot linger close to the peasants for long or they'll ring that damned alarm.",
    "Ringing the bell will bring the guards from all over, I will die",
    "I have to Kill them fast, when they're alone",
    "The hunger... It's almost too much",
  ];
  tutorialTextObject!: Phaser.GameObjects.Text;

  tutorialWillAdvance: boolean = false;
  currentTutorialStep: number = 0;
  TUTORIALAUTOADVANCE: number = 5000;
  tutorialCooldown: number = this.TUTORIALAUTOADVANCE;

  peasantCountText!: Phaser.GameObjects.Text;

  currentTutorialState: TutorialState = TutorialState.TRANSITIONING_IN;

  constructor(gameScene: GameScene) {
    this.parentScene = gameScene;
    this.currentTutorialText = this.tutorialTexts[0];

    this.peasantCountText = this.parentScene.add.text(10, 10, "Peasants left: ", {
      fontSize: "24px",
      stroke: "#000000",
      strokeThickness: 10,
    });
    this.peasantCountText.setDepth(100);
    this.peasantCountText.setScrollFactor(0, 0);

    this.tutorialTextObject = this.parentScene.add.text(
      this.parentScene.cameras.main.width / 2,
      this.parentScene.cameras.main.height / 2,
      this.tutorialTexts[0],
      {
        fontSize: "24px",
        stroke: "#000000",
        strokeThickness: 10,
      }
    );
    this.tutorialTextObject.setDepth(100);
    this.tutorialTextObject.setScrollFactor(0, 0);
    this.tutorialTextObject.alpha = 0;
    this.setTutorialTextPosition();
  }

  setTutorialTextPosition() {
    const widthCenter = this.parentScene.cameras.main.width / 2;
    const heightCenter = this.parentScene.cameras.main.height - this.parentScene.cameras.main.height / 5;

    this.tutorialTextObject.setOrigin(0.5);

    this.tutorialTextObject.setPosition(widthCenter, heightCenter + TILE_SIZE);
  }

  update(delta: number) {
    const countText = "Peasants left: " + this.parentScene.peasants.countActive();
    if (countText != this.peasantCountText.text) {
      this.peasantCountText.setText(countText);
    }

    switch (this.currentTutorialState) {
      case TutorialState.SHOWING_TEXT:
        this.tutorialCooldown -= delta;
        if (this.tutorialCooldown < 0) {
          this.currentTutorialStep++;
          this.tutorialCooldown = this.TUTORIALAUTOADVANCE;
          this.currentTutorialState = TutorialState.TRANSITIONING_OUT;
        }
        break;
      case TutorialState.TRANSITIONING_OUT:
        this.parentScene.tweens.add({
          targets: this.tutorialTextObject,
          duration: 1000,
          props: { alpha: 0 },
          onComplete: () => this.swapToNextText(),
        });
        this.currentTutorialState = TutorialState.PROCESSING;
        break;
      case TutorialState.SWAPPING_NEXT_TEXT:
        this.tutorialTextObject.setText(this.tutorialTexts[this.currentTutorialStep]);
        this.setTutorialTextPosition();
        this.currentTutorialState = TutorialState.TRANSITIONING_IN;
      case TutorialState.TRANSITIONING_IN:
        this.parentScene.tweens.add({
          targets: this.tutorialTextObject,
          duration: 1000,
          props: { alpha: 1 },
          onComplete: () => this.moveToShowingText(),
        });
        this.currentTutorialState = TutorialState.PROCESSING;
        break;
    }
  }

  moveToShowingText() {
    this.currentTutorialState = TutorialState.SHOWING_TEXT;
  }

  swapToNextText() {
    if (this.tutorialTexts[this.currentTutorialStep]) {
      this.currentTutorialState = TutorialState.SWAPPING_NEXT_TEXT;
    } else {
      this.tutorialTextObject.setText("");
      this.currentTutorialState = TutorialState.COMPLETE;
    }
  }
}
