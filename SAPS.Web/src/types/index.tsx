import { SVGProps } from "react";
import { User } from "./User";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Request {
  id: string;
  header: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  updatedAt: Date;
  internalNote?: string;
  responseMessage?: string;
  lastUpdatePersonId: string;
}
