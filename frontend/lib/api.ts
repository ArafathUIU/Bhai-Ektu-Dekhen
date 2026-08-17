const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: { id: number; name: string; slug: string } | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type Report = {
  id: number;
  public_id: string;
  user_id: number;
  issue_id: number | null;
  category_id: number | null;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  status: string;
  created_at: string;
  category: Category | null;
  media: Media[];
  analyses?: AiAnalysis[];
  user?: { id: number; name: string } | null;
  issue?: { id: number; public_id: string } | null;
};

export type Issue = {
  id: number;
  public_id: string;
  category_id: number | null;
  title: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  severity: string;
  status: string;
  created_at: string;
  category: Category | null;
  supports_count?: number;
};

export type Media = {
  id: number;
  type: string;
  url: string | null;
  mime_type: string | null;
};

export type EmergencyStation = {
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
};

export type EmergencyNumbers = { service: string; number: string };

export type EmergencyResult = {
  police_stations: EmergencyStation[];
  fire_stations: EmergencyStation[];
  emergency_numbers: EmergencyNumbers[];
  source: "overpass" | "fallback";
};

export type Comment = {
  id: number;
  issue_id: number;
  user_id: number;
  body: string;
  created_at: string;
  user: { id: number; name: string };
};

export type StatusHistoryEntry = {
  id: number;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  created_at: string;
  changed_by: { id: number; name: string } | null;
};

export type AiAnalysis = {
  id: number;
  predicted_category_slug: string | null;
  confidence: number | null;
  severity_score: number | null;
  status: string;
  created_at: string;
  processing_time_ms: number | null;
};

export type IssueDetail = Issue & {
  description: string | null;
  reports: (Report & { user: { name: string } | null })[];
  statusHistory: StatusHistoryEntry[];
  supports: { user_id: number }[];
  aiAnalyses: AiAnalysis[];
};

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
  data: Record<string, unknown> | null;
};

export type Assignment = {
  id: number;
  issue: Issue & { public_id: string };
  team: { id: number; name: string } | null;
  assigned_by: { id: number; name: string } | null;
  status: string;
  priority: string;
  deadline: string | null;
  assigned_at: string;
  created_at: string;
};

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('bek_token', t);
    else localStorage.removeItem('bek_token');
  }
}

export function getToken(): string | null {
  if (token) return token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('bek_token');
  }
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return res.json();
}

export const api = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    request<{ data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: () =>
    request<{
      data: {
        user: User;
        stats: { reports_submitted: number; issues_supported: number; member_since: string };
      };
    }>('/auth/profile'),
  reports: () => request<{ data: { reports: { data: Report[] } } }>('/reports'),
  createReport: (form: FormData) =>
    request<{ data: { report: Report } }>('/reports', { method: 'POST', body: form }),
  issues: (filters?: { category?: string; status?: string; severity?: string }) =>
    request<{ data: { issues: { data: Issue[] } } }>(
      `/issues?${new URLSearchParams(
        Object.fromEntries(Object.entries(filters ?? {}).filter(([, v]) => v)),
      ).toString()}`,
    ),
  categories: () => request<{ data: { categories: Category[] } }>('/categories'),
  issue: (publicId: string) =>
    request<{ data: { issue: IssueDetail } }>(`/issues/${publicId}`),
  issueComments: (publicId: string) =>
    request<{ data: { comments: Comment[] } }>(
      `/issues/${publicId}/comments`,
    ),
  supportIssue: (publicId: string) =>
    request<{ data: { support_count: number } }>(`/issues/${publicId}/support`, { method: 'POST' }),
  nearby: (lat: number, lng: number, radius = 500) =>
    request<{ data: { issues: Issue[] } }>(`/map/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`),
  emergencyNearby: (lat: number, lng: number, radius = 10000) =>
    request<{ data: EmergencyResult }>(
      `/emergency/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    ),
  notifications: () =>
    request<{ data: { notifications: { data: NotificationItem[] }; unread_count: number } }>('/notifications'),
  unreadCount: () =>
    request<{ data: { unread_count: number } }>('/notifications/unread-count'),
  markNotificationRead: (id: number) =>
    request<{ data: { notification: NotificationItem } }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<{ data: { unread_count: number } }>('/notifications/read-all', { method: 'POST' }),
  moderationQueue: () =>
    request<{ data: { reports: { data: Report[] } } }>('/admin/moderation'),
  verifyReport: (publicId: string) =>
    request<{ data: { report: Report } }>(`/reports/${publicId}/verify`, { method: 'POST' }),
  rejectReport: (publicId: string, reason: string) =>
    request<{ data: { report: Report } }>(`/reports/${publicId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  adminAssignments: () =>
    request<{ data: { assignments: { data: Assignment[] } } }>('/admin/assignments'),
  updateAssignmentStatus: (id: number, status: string) =>
    request<{ data: { assignment: Assignment } }>(`/admin/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  dashboard: () =>
    request<{
      data: {
        total_issues: number;
        open_issues: number;
        resolved_issues: number;
        pending_reports: number;
        by_status: Record<string, number>;
        by_severity: Record<string, number>;
        recent_issues: { public_id: string; title: string; status: string; severity: string }[];
      };
    }>('/admin/dashboard'),
};
