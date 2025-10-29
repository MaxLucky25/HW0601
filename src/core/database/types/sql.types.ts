// Типы для результатов SQL запросов
export interface TableInfo {
  table_name: string;
}

export interface TruncateResult {
  command: string;
  rowCount: number;
}

// Типы для raw SQL данных (snake_case из PostgresSQL)
export interface RawUserRow {
  id: string;
  login: string;
  email: string;
  password_hash: string;
  is_email_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface RawSessionRow {
  id: string;
  token: string;
  user_id: string;
  device_id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  last_active_date: Date;
  expires_at: Date;
  is_revoked: boolean;
}

export interface RawEmailConfirmationRow {
  user_id: string;
  confirmation_code: string;
  expiration_date: Date;
  is_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RawPasswordRecoveryRow {
  user_id: string;
  recovery_code: string;
  expiration_date: Date;
  is_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

// Blog types
export interface RawBlogRow {
  id: string;
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

// Post types
export interface RawPostRow {
  id: string;
  title: string;
  short_description: string;
  content: string;
  blog_id: string;
  created_at: Date;
  deleted_at: Date | null;
}

// Post Likes types
export interface RawPostLikeRow {
  id: string;
  user_id: string;
  post_id: string;
  status: string; // LikeStatus enum value
  added_at: Date;
}

// Comment types
export interface RawCommentRow {
  id: string;
  content: string;
  post_id: string;
  commentator_id: string;
  created_at: Date;
  deleted_at: Date | null;
}

// Comment Likes types
export interface RawCommentLikeRow {
  id: string;
  user_id: string;
  comment_id: string;
  status: string; // LikeStatus enum value
  added_at: Date;
}
