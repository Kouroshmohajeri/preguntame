import User, { IUser } from "../models/User.js";

export const UserRepository = {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  async updateUser(email: string, updates: Partial<IUser>): Promise<IUser | null> {
    return User.findOneAndUpdate({ email }, updates, { new: true });
  },

  async getAllUsers(): Promise<IUser[]> {
    return User.find().sort({ createdAt: -1 });
  },

  async deleteUserByEmail(email: string): Promise<void> {
    await User.findOneAndDelete({ email });
  },
};
