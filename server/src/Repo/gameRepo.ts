import Game, { IGame, IQuestion } from "../models/Game.js";
import { customAlphabet } from "nanoid";

export const GameRepository = {
  async createGame(
    title: string,
    questions: IQuestion[],
    hostId: string,
    isAi: boolean = false,
  ): Promise<IGame> {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generateCode = customAlphabet(alphabet, 6);

    let gameCode: string;
    do {
      gameCode = generateCode();
    } while (await Game.findOne({ gameCode }));

    const orderedQuestions = questions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    const game = new Game({
      title,
      gameCode,
      questions: orderedQuestions,
      hostId,
      isAi,
    });

    await game.save();
    return game;
  },
  async getGamesByHost(hostId: string): Promise<IGame[]> {
    return Game.find({ hostId }).sort({ createdAt: -1 });
  },
  async getGameByCode(gameCode: string): Promise<IGame | null> {
    return Game.findOne({ gameCode });
  },

  async getAllGames(): Promise<IGame[]> {
    return Game.find().sort({ createdAt: -1 });
  },

  async deleteGame(gameCode: string): Promise<void> {
    await Game.findOneAndDelete({ gameCode });
  },
  async updateGame(
    gameCode: string,
    title: string,
    questions: IQuestion[],
    hostId: string,
    isAi?: boolean,
  ): Promise<IGame | null> {
    const orderedQuestions = questions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    const updateData: any = {
      title,
      questions: orderedQuestions,
      updatedAt: new Date(),
    };

    if (isAi !== undefined) {
      updateData.isAi = isAi;
    }

    const updatedGame = await Game.findOneAndUpdate(
      { gameCode, hostId },
      updateData,
      { new: true, runValidators: true },
    );

    return updatedGame;
  },
};
