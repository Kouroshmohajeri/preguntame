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

  async searchUsersForAutocomplete(
    query: string,
    excludeEmail?: string
  ): Promise<Partial<IUser>[]> {
    const users = (await User.find(
      {
        $and: [
          {
            $or: [
              { email: { $regex: query, $options: "i" } },
              { name: { $regex: query, $options: "i" } },
              { lastname: { $regex: query, $options: "i" } },
            ],
          },
          excludeEmail ? { email: { $ne: excludeEmail } } : {}, // <--- EXCLUDE HERE
        ],
      },
      { _id: 1, email: 1, name: 1, lastname: 1, avatar: 1 }
    )
      .limit(10)
      .lean()) as unknown as Partial<IUser>[];

    return users.map((user) => {
      if (!user.avatar && user.email) {
        const seed = encodeURIComponent(user.email);
        user.avatar = `https://api.dicebear.com/8.x/big-ears/svg?seed=${seed}`;
      }
      return user;
    });
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
  async decrementGamesCreated(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { gamesCreated: -1 } },
      { new: true }
    );
  },
};
