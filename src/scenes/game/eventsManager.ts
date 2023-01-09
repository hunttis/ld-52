import { GameScene } from "../gameScene";
import { Gender } from "./peasant";

const phaserEventEmitter = new Phaser.Events.EventEmitter();
export const eventManager = {
  emit: <E extends Events>(event: E, game: GameScene, data: EventData[E]) => phaserEventEmitter.emit(event, game, data),
  on: <E extends Events>(event: E, callback: (game: GameScene, data: EventData[E]) => void) =>
    phaserEventEmitter.on(event, callback),
};

export type GameOverReason = "cleric" | "bell" | "debug";

export type EventData = {
  [Events.KILL_NEAR]: {};
  [Events.PEASANT_KILLED]: { location: Phaser.Math.Vector2; gender: Gender };
  [Events.GAME_OVER]: {reason: GameOverReason};
  [Events.GAME_WON]: {};
  [Events.BELL_RUNG]: {};
  [Events.SPAWN_GUARD]: { location: Phaser.Math.Vector2 };
};

export enum Events {
  KILL_NEAR = "KILL_NEAR",
  PEASANT_KILLED = "PEASANT_KILLED",
  GAME_OVER = "GAME_OVER",
  GAME_WON = "GAME_WON",
  BELL_RUNG = "BELL_RUNG",
  SPAWN_GUARD = "SPAWN_GUARD",
}
