export type TeamStatus = "Active" | "Hidden";

export type TeamMember = {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  image: string;
  displayOrder: number;
  status: TeamStatus;
};

export type TeamMemberFormData = {
  name: string;
  designation: string;
  bio: string;
  image: string;
  displayOrder: number;
  status: TeamStatus;
};