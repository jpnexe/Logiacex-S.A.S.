/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = 'ADMIN' | 'VISITOR';

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'REJECTED';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
}

export interface Appointment {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  notes: string;
  status: AppointmentStatus;
  date: string;
  time: string;
  assignedUser?: string; // name of the admin who attended it or was assigned
  createdAt: string;
  qrCodeData: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalLeads: number;
  pendingValidation: number;
  approvedLeads: number;
  conversionRate: number; // percentage of leads approved
  byStatus: {
    PENDING: number;
    APPROVED: number;
    RESCHEDULED: number;
    REJECTED: number;
  };
  monthlyProgress: {
    month: string;
    received: number;
    converted: number;
  }[];
}

export interface ArchitectureProposal {
  frontend: string;
  backend: string;
  database: string;
  sqlScript: string;
  endpoints: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    payload?: string;
    response: string;
  }[];
}
