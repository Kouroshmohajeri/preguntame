import User, { IUser } from "../models/User.js";

export const UserRepository = {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const seed = encodeURIComponent(
      userData.email ?? userData.name ?? "default"
    );

    const avatar = `https://api.dicebear.com/8.x/big-ears/svg?seed=${seed}`;

    const user = new User({
      ...userData,
      avatar,
    });

    await user.save();
    return user;
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  async updateUser(
    email: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return User.findOneAndUpdate({ email }, updates, { new: true });
  },
  async incrementGamesCreated(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { gamesCreated: 1 } },
      { new: true }
    );
  },
  async getAllUsers(): Promise<IUser[]> {
    return User.find().sort({ createdAt: -1 });
  },

  async deleteUserByEmail(email: string): Promise<void> {
    await User.findOneAndDelete({ email });
  },
};
