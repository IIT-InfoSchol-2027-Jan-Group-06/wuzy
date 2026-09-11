import { ImageSourcePropType } from 'react-native';

import { assetUrl, type ApiUser } from '@/lib/api';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

export interface Connection {
  id: string;
  name: string;
  username: string;
  avatar: ImageSourcePropType;
  online: boolean;
  tags: string[];
}

/** Shape a backend user into a `Connection` card. Presence and interests come from the profile; avatars fall back when missing. */
export function toConnection(user: ApiUser): Connection {
  return {
    id: String(user.id),
    name: user.display_name ?? user.username,
    username: `@${user.username}`,
    avatar: user.avatar_url ? { uri: assetUrl(user.avatar_url) } : defaultAvatar,
    online: false,
    tags: user.hobbies ?? [],
  };
}
