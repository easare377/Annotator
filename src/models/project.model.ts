export interface Project {
    name: string;
    createdAt: Date;
    stats: {
      total: number;
      success: number;
      error: number;
      warning: number;
    };
    initials: string;
  }
  