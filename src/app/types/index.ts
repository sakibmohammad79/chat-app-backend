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

export const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  bio: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
} as const;
