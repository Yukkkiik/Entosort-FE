export type UserRole = "Admin" | "Operator" | "Viewer";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  avatar: string;
}

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@biolab.id",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-05-15 09:42",
    avatar: "AF",
  },
  {
    id: "u2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@biolab.id",
    role: "Operator",
    status: "Active",
    lastLogin: "2024-05-15 08:17",
    avatar: "SN",
  },
  {
    id: "u3",
    name: "Budi Santoso",
    email: "budi.santoso@biolab.id",
    role: "Operator",
    status: "Inactive",
    lastLogin: "2024-05-10 14:30",
    avatar: "BS",
  },
  {
    id: "u4",
    name: "Dewi Lestari",
    email: "dewi.lestari@biolab.id",
    role: "Viewer",
    status: "Active",
    lastLogin: "2024-05-14 16:55",
    avatar: "DL",
  },
  {
    id: "u5",
    name: "Rizky Pratama",
    email: "rizky.pratama@biolab.id",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-05-08 11:20",
    avatar: "RP",
  },
];

export const avatarColors: Record<string, string> = {
  AF: "from-violet-500 to-violet-700",
  SN: "from-pink-500 to-rose-600",
  BS: "from-blue-500 to-blue-700",
  DL: "from-amber-500 to-orange-600",
  RP: "from-teal-500 to-teal-700",
};