import { User } from '@/types/auth';

// Hardcoded users
export const HARDCODED_USERS: User[] = [
  {
    id: '1',
    username: 'mubasheramin447',
    password: 'mubashir123',
    name: 'Mubashir Amin',
    email: 'mubasheramin447@gmail.com',
  },
  {
    id: '2',
    username: 'sohaibasghar1997',
    password: 'sohaib123',
    name: 'Sohaib',
    email: 'sohaibasghar1997@gmail.com',
  },
  {
    id: '3',
    username: 'dr.manzoor',
    password: 'dr.manzoor123',
    name: 'Dr. Manzoor',
    email: 'dr.manzoor@gmail.com',
  },
];

export function authenticateUser(
  username: string,
  password: string,
): User | null {
  const user = HARDCODED_USERS.find(
    (u) => u.username === username && u.password === password,
  );
  return user || null;
}

export function getUserById(id: string): User | null {
  return HARDCODED_USERS.find((u) => u.id === id) || null;
}

