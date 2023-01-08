import { GameScene } from "../gameScene";
import { eventManager, Events } from "./eventsManager";
import { Gender } from "./peasant";

enum DeadPeasantState {
  STILL,
  CARRIED,
  BURIED,
}

export class DeadPeasant extends Phaser.Physics.Arcade.Sprite {
  parentScene: GameScene;
  currentState: DeadPeasantState = DeadPeasantState.STILL;
  gender: string;

  constructor(gameScene: GameScene, xLoc: number, yLoc: number, gender: Gender) {
    super(gameScene, xLoc, yLoc, "null"); // Should probably be a bloody body instead of just blood
    this.parentScene = gameScene;
    this.name = "DeadPeasant";
    this.gender = gender;
    //this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
  }

  create() {
    this.anims.create({
      key: "peasant_man_death",
      frames: "peasant_man_death",
      frameRate: 60,
      repeat: 0,
    });

    this.anims.create({
      key: "peasant_woman_death",
      frames: "peasant_woman_death",
      frameRate: 60,
      repeat: 0,
    });

    this.anims.play(`peasant_${this.gender}_death`);
  }
}

eventManager.on(Events.PEASANT_KILLED, (game, { location, gender }) => {
  const peasant = new DeadPeasant(game, location.x, location.y, gender);
  peasant.create();
  game.add.existing(peasant);
});
