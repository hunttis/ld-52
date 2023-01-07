import { GameScene } from "../gameScene";

export const phaserEventEmitter = new Phaser.Events.EventEmitter();
export const eventManager = {
  emit: <E extends Events>(event: E, game: GameScene, data: EventData[E]) => phaserEventEmitter.emit(event, game, data),
  on: <E extends Events>(event: E, callback: (game: GameScene, data: EventData[E]) => void) =>
    phaserEventEmitter.on(event, callback),
};

export type EventData = {
  [Events.KILL_NEAR]: {};
  [Events.PEASANT_KILLED]: { location: Phaser.Math.Vector2 };
};

export enum Events {
  KILL_NEAR = "KILL_NEAR",
  PEASANT_KILLED = "PEASANT_KILLED",
}
