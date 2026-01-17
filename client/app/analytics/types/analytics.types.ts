export interface AnalyticsData {
  totalUsers: number;
  totalGames: number;
  totalGameResults: number;
  usersThisWeek: number;
  usersToday: number;
}

export interface VercelAnalytics {
  activeUsers: number;
  topCountry: string;
}

export interface UserDetail {
  _id: string;
  name: string;
  lastname?: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  emailNotifications?: boolean;
  currentSubscription?: {
    plan: string;
    status: string;
    endDate: Date;
  };
  createdAt: Date;
}

export interface GameResultDetail {
  _id: string;
  gameCode: string;
  hostId: string;
  players: Array<{
    playerId: string;
    name: string;
    avatar?: string;
    score: number;
    correct: number;
    wrong: number;
    isAssigned: boolean;
  }>;
  createdAt: Date;
}

export interface GameDetail {
  _id: string;
  gameCode: string;
  title: string;
  hostId: string;
  questions: Array<{
    text: string;
    answers: Array<{
      text: string;
      correct: boolean;
    }>;
    order: number;
    time: number;
  }>;
  createdAt: Date;
}

export interface FilterState {
  questionTime: string;
  dateFrom: string;
  dateTo: string;
  host: string;
  questionCount: string;
  answerCount: string;
}

export type SortOption = "date" | "questions" | "answers";
