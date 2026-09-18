import axios from "axios";

// ========================================
// API CONFIGURATION
// ========================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const TEAM_API = `${API_URL}/api/teams`;

// ========================================
// TYPES
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

// ========================================
// GET ALL TEAM MEMBERS
// ADMIN
//
// GET /api/teams
// ========================================

export const getTeamMembers =
  async (): Promise<TeamMember[]> => {
    const response =
      await axios.get<TeamMember[]>(
        TEAM_API
      );

    return response.data;
  };

// ========================================
// GET PUBLIC TEAM MEMBERS
//
// GET /api/teams/public
//
// Useful if you ever need this service
// outside the public frontend.
// ========================================

export const getPublicTeamMembers =
  async (): Promise<TeamMember[]> => {
    const response =
      await axios.get<TeamMember[]>(
        `${TEAM_API}/public`
      );

    return response.data;
  };

// ========================================
// CREATE TEAM MEMBER
//
// POST /api/teams
// ========================================

export const createTeamMember = async (
  data: TeamMemberPayload
): Promise<TeamMember> => {
  const response = await axios.post<{
    message: string;
    member: TeamMember;
  }>(
    TEAM_API,
    data
  );

  return response.data.member;
};

// ========================================
// UPDATE TEAM MEMBER
//
// PUT /api/teams/:id
//
// Partial<> allows things like:
//
// { status: "Hidden" }
//
// without requiring name/designation.
// ========================================

export const updateTeamMember = async (
  id: string,
  data: UpdateTeamMemberPayload
): Promise<TeamMember> => {
  const response = await axios.put<{
    message: string;
    member: TeamMember;
  }>(
    `${TEAM_API}/${id}`,
    data
  );

  return response.data.member;
};

// ========================================
// DELETE TEAM MEMBER
//
// DELETE /api/teams/:id
// ========================================

export const deleteTeamMember = async (
  id: string
): Promise<void> => {
  await axios.delete(
    `${TEAM_API}/${id}`
  );
};

// ========================================
// REORDER TEAM MEMBERS
//
// PUT /api/teams/reorder
// ========================================

export const reorderTeamMembers = async (
  members: TeamMember[]
): Promise<TeamMember[]> => {
  const response = await axios.put<{
    message: string;
    members: TeamMember[];
  }>(
    `${TEAM_API}/reorder`,
    {
      members: members.map(
        (member) => ({
          _id: member._id,
        })
      ),
    }
  );

  return response.data.members;
};