export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
