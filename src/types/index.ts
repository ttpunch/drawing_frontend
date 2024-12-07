export interface User {
    _id: string;
    username: string;
    role: 'user' | 'admin';
    isApproved: boolean;
    createdAt: string;
  }
  
  export interface Drawing {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    user: User;
    ratings: Rating[];
    averageRating: number;
    createdAt: string;
  }
  
  export interface Rating {
    user: User;
    value: number;
  }
  
  export interface Comment {
    _id: string;
    content: string;
    drawing: string;
    user: User;
    createdAt: string;
  }
  
  export interface AuthResponse {
    token: string;
    message?: string;
  }
  
  export interface ApiError {
    message: string;
  }