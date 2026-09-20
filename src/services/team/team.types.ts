// ========================================
// TEAM TYPES
// ========================================

export type TeamStatus =
  | "Active"
  | "Hidden";

export type TeamMember = {
  _id: string;

  name: string;

  designation: string;

  bio?: string;

  image?: string;

  order: number;

  status: TeamStatus;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE PAYLOAD
//
// Name + designation are required when
// creating a new team member.
// ========================================

export type TeamMemberPayload = {
  name: string;

  designation: string;

  bio?: string;

  image?: string;

  order?: number;

  status?: TeamStatus;
};

// ========================================
// UPDATE PAYLOAD
//
// All fields are optional because we may
// update only status, name, image, etc.
// ========================================

export type UpdateTeamMemberPayload =
  Partial<TeamMemberPayload>;
