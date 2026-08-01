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

export const conversationSelect = {
  id: true,
  isGroup: true,
  name: true,
  avatar: true,
  inviteToken: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: {
      id: true,
      role: true,
      joinedAt: true,
      lastReadAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    },
  },
  // Last message preview — conversation list e dorkar
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" as const },
    where: { isDeleted: false },
    select: {
      id: true,
      content: true,
      type: true,
      createdAt: true,
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
  },
} as const;
