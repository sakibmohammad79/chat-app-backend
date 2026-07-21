// user return without password
export const excludePassword = (user: {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}) => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
