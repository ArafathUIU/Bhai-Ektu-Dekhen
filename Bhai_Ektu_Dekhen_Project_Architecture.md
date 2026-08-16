# Bhai Ektu Dekhen 👀

> A community-powered civic issue reporting and tracking platform that uses geotagged photos, computer vision, geospatial intelligence, community validation, and automated prioritization to identify and track local infrastructure problems.

---

# Part 1 — Product Definition

## 1. The Problem

In Bangladesh, issues such as broken roads, blocked drains, damaged street lights, and illegal garbage dumping are common, but there is often no centralized way to:

- Report local infrastructure problems
- Know exactly where a problem exists
- Prevent duplicate reports
- Determine which problems are most urgent
- Track what happened after a report
- Identify recurring infrastructure problems
- Give authorities a structured workflow for resolving issues

**Bhai Ektu Dekhen** aims to solve this gap.

## 2. Core Idea

> **“দেখলেন সমস্যা? ছবি তুলুন, location দিন, বাকিটা system দেখবে।”**

Basic flow:

```text
📸 Photo
   +
📍 Location
   +
📝 Optional description
        ↓
   Bhai Ektu Dekhen
        ↓
   Issue Intelligence
        ↓
   Resolution Tracking
```

## 3. Users

### 👤 Citizen

Can:

- Report an issue
- Upload a photo
- Capture or adjust location
- View their reports
- Track report status
- Support existing issues
- Verify whether an issue was actually resolved

### 🏛️ Moderator / Authority

Can:

- Review reports
- Verify or reject reports
- Change severity
- Assign issues
- Update status
- Track resolution
- Review resolution evidence

### 🤖 AI System

Can:

- Classify images
- Suggest issue categories
- Estimate severity
- Generate image embeddings
- Detect possible duplicates
- Help identify suspicious/spam reports

## 4. V1 Categories

Keep the initial scope intentionally small.

### 🕳️ Road

- Pothole
- Cracked road
- Broken pavement

### 🚰 Drainage

- Blocked drain
- Overflow
- Open/damaged drain

### 💡 Street Light

- Broken light
- Missing light
- Damaged pole

### 🗑️ Garbage

- Illegal dumping
- Overflowing garbage
- Uncollected waste

## 5. What Makes It Different?

A basic version would be:

```text
User → Form → Database → Admin
```

That is just CRUD.

The target architecture is:

```text
Citizen Reporting
+
Computer Vision
+
Geospatial Intelligence
+
Duplicate Detection
+
Community Validation
+
Issue Prioritization
```

## 6. Product Positioning

> **Bhai Ektu Dekhen is a civic issue intelligence platform, not simply a complaint form.**

---

# Part 2 — Complete User Journey + System Flow

## 1. Homepage

```text
┌─────────────────────────────────────┐
│       Bhai Ektu Dekhen 👀           │
│                                     │
│  আপনার এলাকার সমস্যা জানান।         │
│  আমরা দেখব। সবাই মিলে ঠিক করব।      │
│                                     │
│        [ Report an Issue ]          │
│                                     │
│        🗺️ Explore Issues            │
└─────────────────────────────────────┘
```

Main actions:

- Report an Issue
- Explore Map
- My Reports

## 2. Report an Issue

User can select a category:

```text
Report an Issue
────────────────────

What did you find?

🕳️ Road Damage
🚰 Drainage
💡 Street Light
🗑️ Garbage

[Continue]
```

However, manual classification is optional because AI will suggest the category after image analysis.

## 3. Take / Upload Photo

```text
Report an Issue

        ┌───────────────┐
        │               │
        │   📸 Photo    │
        │               │
        └───────────────┘

[ Take Photo ]

or

[ Upload from Device ]
```

Frontend validates:

- File type
- File size
- Image dimensions

## 4. Capture Location

```text
📍 Location

We detected:

Mymensingh
23.xxxx, 90.xxxx

[ Use This Location ]

[ Pick Location Manually ]
```

Manual adjustment is important because GPS may not represent the exact location of the issue.

## 5. AI Analysis

```text
          📸 IMAGE
              │
              ▼
       Image Processing
              │
              ▼
       Computer Vision
              │
       ┌──────┴──────┐
       ▼             ▼
   Category       Confidence
       │             │
       └──────┬──────┘
              ▼
        AI Result
```

Example:

```text
AI Analysis Complete

🕳️ Road Damage

Likely issue:
Pothole

Confidence:
94%

Suggested severity:
HIGH
```

The user confirms:

```text
Is this correct?

[ ✓ Yes ]

[ Change Category ]
```

AI is advisory, not the final authority.

## 6. Description

Optional:

```text
Tell us more

"বাসস্ট্যান্ডের সামনে বড় গর্ত।
বৃষ্টির সময় পানিতে ডুবে যায়।"

[ Submit Report ]
```

The description can later be analyzed for additional context.

## 7. Duplicate Detection

Before creating a completely new issue, the system checks nearby existing issues.

```text
New Report
     │
     ▼
Search nearby issues
     │
     ├── No match
     │       ↓
     │   New Issue
     │
     └── Possible match
             ↓
        Similarity check
             ↓
        Existing Issue
```

Example:

```text
⚠️ Possible existing issue

A similar pothole was reported
38 meters from this location.

Reported by 7 people.

[ Support Existing Issue ]

[ Report Separately ]
```

## 8. Report Submitted

```text
🎉 Report Submitted

Issue ID:
BEK-10482

Category:
Road Damage

Location:
Mymensingh

Status:
🟡 Under Review

[ Track Report ]
```

## 9. My Reports

```text
My Reports
──────────────────────────

BEK-10482
🕳️ Road Damage
🟡 Under Review
2 hours ago

BEK-10391
🗑️ Garbage
🟢 Resolved
3 days ago

BEK-10282
💡 Street Light
🟢 Closed
1 week ago
```

## 10. Report Details

```text
BEK-10482

🕳️ Road Damage

📍 Mymensingh

Reported:
16 Aug, 10:42 AM

────────────────────

Status

● Reported
│
● Under Review
│
○ Verified
│
○ Assigned
│
○ In Progress
│
○ Resolved
│
○ Closed
```

## 11. Community Support

Citizens can confirm an issue they have also experienced.

```text
BEK-10482

🕳️ Large Pothole

👥 27 people confirmed this issue

🔥 Priority: HIGH
```

## 12. Authority Dashboard

```text
Dashboard

Total Issues       1,284
Open Issues          347
In Progress          82
Resolved             855

Critical              18
High                  76
```

The dashboard includes:

- Issue map
- Filters
- Severity
- Category
- Status
- Area
- Assignment information

## 13. Issue Review

```text
Issue #BEK-10482

🕳️ Road Damage

Location:
[ Map ]

AI Classification:
Pothole — 94%

Community confirmations:
27

Reports merged:
8

Severity:
HIGH

Status:
VERIFIED
```

Admin actions:

```text
[ Assign Team ]

[ Change Severity ]

[ Reject ]

[ Mark Resolved ]
```

## 14. Assignment

```text
Assign Issue

Issue:
BEK-10482

Department:
Road Maintenance

Team:
Mymensingh Zone 3

Priority:
HIGH

Deadline:
20 Aug 2026

[ Assign ]
```

## 15. Resolution

The responsible team uploads evidence:

```text
Issue #BEK-10482

Status:
🟢 RESOLVED

Resolution proof:

📸 Before
📸 After

Resolved:
18 Aug 2026
```

## 16. Citizen Verification

The citizen receives a notification:

> Issue BEK-10482 has been marked as resolved.

They can respond:

```text
Was this actually fixed?

👍 Yes

👎 No
```

If enough users say it is not fixed, the issue can be reopened or sent for review.

## 17. Complete Lifecycle

```text
              CITIZEN
                 │
                 ▼
            📸 Take Photo
                 │
                 ▼
            📍 Add Location
                 │
                 ▼
          🤖 AI Classification
                 │
                 ▼
          Duplicate Detection
                 │
                 ▼
            Submit Report
                 │
                 ▼
              REPORTED
                 │
                 ▼
            UNDER REVIEW
                 │
                 ▼
              VERIFIED
                 │
                 ▼
              ASSIGNED
                 │
                 ▼
             IN PROGRESS
                 │
                 ▼
              RESOLVED
                 │
                 ▼
        Citizen Verification
            │           │
          👍            👎
           │             │
           ▼             ▼
         CLOSED       REOPENED
```

## 18. Core Principle

AI should not be the final authority.

```text
AI
+
Geospatial Data
+
Community
+
Human Moderation
        ↓
Final Issue Intelligence
```

---

# Part 3 — System Architecture

## 1. Architecture Strategy

Do **not** start with microservices.

Use:

> **Modular Monolith + Separate AI Worker**

This keeps the project manageable while still allowing production-grade architecture.

## 2. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         │   Web / Mobile Web  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Next.js        │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │ HTTPS
                                    ▼
                    ┌──────────────────────────────┐
                    │          BACKEND API         │
                    │       Laravel / FastAPI      │
                    │                              │
                    │ Auth                         │
                    │ Reports                      │
                    │ Issues                       │
                    │ Users                        │
                    │ Moderation                   │
                    │ Notifications                │
                    └───────┬──────────┬───────────┘
                            │          │
                 ┌──────────┘          └─────────────┐
                 ▼                                    ▼
        ┌─────────────────┐                  ┌─────────────────┐
        │   PostgreSQL    │                  │      Redis      │
        │    + PostGIS    │                  │ Queue / Cache   │
        └─────────────────┘                  └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │    AI Worker    │
                                             │                 │
                                             │ CV              │
                                             │ Embeddings      │
                                             │ Duplicate       │
                                             │ Detection       │
                                             └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │ Object Storage  │
                                             │ Photos / Proof  │
                                             └─────────────────┘
```

## 3. Frontend — Next.js

Use:

- Next.js
- TypeScript

Responsibilities:

```text
Authentication
     │
     ├── Login
     ├── Register
     └── Profile

Citizen
     │
     ├── Create Report
     ├── My Reports
     ├── Issue Details
     └── Notifications

Map
     │
     ├── Explore Issues
     ├── Nearby Issues
     └── Filters

Admin
     │
     ├── Dashboard
     ├── Issue Management
     ├── Assignments
     └── Analytics
```

The frontend does not perform AI inference.

## 4. Backend — Laravel

Recommended backend:

> **Laravel**

Logical modules:

```text
Laravel
│
├── Auth Module
├── User Module
├── Report Module
├── Issue Module
├── Moderation Module
├── Assignment Module
├── Notification Module
├── Map / Geo Module
└── AI Integration Module
```

Keep these as modules inside one backend rather than separate microservices.

## 5. PostgreSQL + PostGIS

PostgreSQL stores application data.

PostGIS handles spatial data and queries.

Examples:

- Find issues within 500 meters
- Find nearby unresolved issues
- Query reports inside a geographic boundary
- Generate map-based analytics
- Support duplicate detection

Conceptually:

```text
User Location
      │
      ▼
PostGIS
      │
      ▼
Find reports
within 500 meters
```

## 6. Redis

Redis handles:

### Queue

```text
Upload Image
     ↓
Create Report
     ↓
Dispatch AI Job
     ↓
Redis Queue
     ↓
AI Worker
```

### Cache

Cache frequently requested map/issue data.

### Rate Limiting

Protect endpoints against abuse and spam.

## 7. Object Storage

Do not store images directly inside PostgreSQL.

Database stores:

```text
image_url
storage_key
mime_type
size
```

Object storage stores the actual files:

```text
Object Storage
│
├── reports/
│   └── 2026/
│       └── 08/
│           ├── image-001.jpg
│           └── image-002.jpg
│
└── resolutions/
    ├── before/
    └── after/
```

## 8. AI Service

Use a separate Python worker/service.

```text
              Laravel
                 │
                 │ Job
                 ▼
              Redis
                 │
                 ▼
          Python AI Worker
                 │
       ┌─────────┼──────────┐
       ▼         ▼          ▼
      CV     Embeddings   Severity
       │         │          │
       └─────────┼──────────┘
                 ▼
              Result
                 │
                 ▼
             Laravel
```

Python is suitable because of the ecosystem around:

- PyTorch
- Transformers
- OpenCV
- Sentence Transformers
- scikit-learn

## 9. Report Submission Flow

### Step 1 — Frontend

```text
POST /api/v1/reports
```

Payload contains:

```text
image
latitude
longitude
description
```

### Step 2 — Validation

Laravel verifies:

```text
Image?
✓ Valid

Location?
✓ Valid

User?
✓ Authenticated
```

### Step 3 — Object Storage

```text
Laravel
   │
   ▼
Object Storage
   │
   ▼
image_url
```

### Step 4 — Database

Create report:

```text
Report
──────────────
id
user_id
image_url
location
description
status
created_at
```

Initial state:

```text
PROCESSING
```

### Step 5 — Queue

```text
AI_ANALYZE_REPORT
        │
        ▼
      Redis
```

API responds immediately:

```json
{
  "report_id": "BEK-10482",
  "status": "PROCESSING"
}
```

The user does not have to wait for inference.

## 10. AI Worker

Worker receives:

```text
Report #BEK-10482

Image:
storage://reports/xxx.jpg

Location:
...

Description:
...
```

It performs:

```text
Image
  │
  ├── Classification
  │       ↓
  │    Pothole 94%
  │
  ├── Embedding
  │       ↓
  │    [0.021, -0.12, ...]
  │
  └── Severity
          ↓
       HIGH
```

## 11. Duplicate Detection

```text
New Image Embedding
       │
       ▼
Find nearby reports
       │
       ▼
Compare embeddings
       │
       ▼
Similarity Score
```

Example:

```text
Existing Issue #BEK-9121

Distance:
43 meters

Image similarity:
87%

Text similarity:
81%

Overall:
89%

→ Possible duplicate
```

## 12. Severity Score

Initial severity can combine multiple signals:

```text
Severity Score =
    AI visual severity
    +
    community confirmations
    +
    location importance
    +
    number of reports
    +
    issue age
```

Example:

```text
Pothole
+
Near school
+
27 confirmations
+
Open for 8 days
=
🔥 CRITICAL
```

Later, this can become a machine-learning model.

## 13. Event-Driven Mindset

Use application events such as:

```text
ReportCreated
      ↓
AIAnalysisRequested
      ↓
AIAnalysisCompleted
      ↓
DuplicateCheckCompleted
      ↓
IssueVerified
      ↓
IssueAssigned
      ↓
IssueResolved
```

This keeps modules loosely coupled.

## 14. API Structure

```text
/api/v1

/auth
    POST /register
    POST /login
    POST /logout

/reports
    POST /
    GET /
    GET /{id}
    PATCH /{id}
    DELETE /{id}

/issues
    GET /
    GET /{id}
    POST /{id}/support
    POST /{id}/verify
    POST /{id}/reopen

/map
    GET /nearby
    GET /heatmap

/admin
    GET /dashboard
    GET /reports
    PATCH /reports/{id}/status
    POST /issues/{id}/assign

/notifications
    GET /
    PATCH /{id}/read
```

API versioning starts at:

```text
/api/v1
```

## 15. Authentication & Authorization

Roles:

### USER

- Create reports
- View own reports
- Support issues
- Verify resolution

### MODERATOR

- Review reports
- Verify/reject reports
- Manage issues

### ADMIN

- All moderator permissions
- Assign teams
- Manage system
- Access analytics

Backend authorization is mandatory. Hiding buttons in the frontend is not security.

---

# Part 4 — Database Design

## 1. The Most Important Modeling Decision

Do **not** treat a `Report` and an `Issue` as the same thing.

They represent different concepts.

### Report

> “A citizen submitted this observation.”

### Issue

> “The system/community believes this real-world problem exists.”

This distinction enables:

```text
10 citizen reports
        ↓
1 real-world issue
```

This is one of the most important architectural decisions in the project.

---

# 2. Main Entities

The initial database can contain:

```text
users
roles
reports
issues
issue_categories
issue_status_history
issue_supports
assignments
teams
media
ai_analyses
issue_matches
notifications
```

Later we can add:

```text
departments
areas
resolution_verifications
audit_logs
```

---

# 3. Users

```text
users
────────────────────────
id
name
email
password_hash
phone
role_id
status
created_at
updated_at
```

Relationship:

```text
User
 │
 ├── has many Reports
 ├── has many Supports
 ├── has many Notifications
 └── has many Resolution Verifications
```

Do not store role names directly everywhere.

Use a role relationship or enum depending on the final authorization implementation.

---

# 4. Roles

```text
roles
────────────────────────
id
name
```

Possible values:

```text
USER
MODERATOR
ADMIN
```

If the authorization system later needs granular permissions, add:

```text
permissions
role_permissions
```

---

# 5. Issue Categories

```text
issue_categories
────────────────────────
id
name
slug
description
is_active
created_at
updated_at
```

Examples:

```text
road_damage
drainage
street_light
garbage
```

Subcategories can be represented later if needed.

---

# 6. Reports

A report represents a **citizen observation**.

```text
reports
────────────────────────
id
public_id
user_id
description
latitude
longitude
location
status
created_at
updated_at
```

Important:

### PostGIS location

Instead of relying only on:

```text
latitude
longitude
```

use a spatial field such as:

```text
location GEOGRAPHY(POINT, 4326)
```

You can still expose latitude/longitude through the API.

Relationships:

```text
User
  │
  └── Reports

Report
  │
  ├── belongs to User
  ├── has Media
  ├── has AI Analysis
  └── may be linked to an Issue
```

---

# 7. Issues

An issue represents the actual real-world problem.

```text
issues
────────────────────────
id
public_id
category_id
title
description
latitude
longitude
location
severity
status
confidence_score
first_reported_at
last_reported_at
resolved_at
created_at
updated_at
```

Example:

```text
Issue #BEK-10482

Category:
Road Damage

Location:
PostGIS Point

Severity:
HIGH

Status:
VERIFIED

Citizen Reports:
8
```

The issue can have many reports:

```text
Issue
 │
 ├── Report #1
 ├── Report #2
 ├── Report #3
 ├── Report #4
 └── Report #5
```

---

# 8. Report → Issue Relationship

A report may initially have no issue:

```text
Report
  ↓
AI Processing
  ↓
Duplicate Detection
  ↓
Possible Existing Issue?
```

If no:

```text
Report
  ↓
Create Issue
```

If yes:

```text
Report
  ↓
Attach to Existing Issue
```

Therefore:

```text
issues
   1
   │
   │ has many
   ▼
reports
```

And:

```text
reports.issue_id
```

can be nullable while processing.

---

# 9. Media

Don't create separate `photo_url`, `before_photo`, `after_photo` columns everywhere.

Use a generic media table:

```text
media
────────────────────────
id
user_id
mediable_type
mediable_id
type
storage_key
mime_type
size
metadata
created_at
```

Possible `type` values:

```text
REPORT_PHOTO
RESOLUTION_BEFORE
RESOLUTION_AFTER
```

This allows one report or issue to have multiple images.

---

# 10. AI Analyses

Store AI results separately.

```text
ai_analyses
────────────────────────
id
report_id
model_name
model_version
predicted_category
confidence
severity_score
embedding_key
processing_time_ms
status
metadata
created_at
```

Example:

```text
model:
civic-vision-v1

prediction:
pothole

confidence:
0.94

severity:
0.81
```

This is useful because AI models will evolve.

You don't want old reports to lose their historical inference data.

---

# 11. Issue Matches

When the duplicate detection system finds a possible match:

```text
issue_matches
────────────────────────
id
report_id
issue_id
geo_distance_meters
image_similarity
text_similarity
overall_similarity
decision
created_at
```

Possible decisions:

```text
PENDING
MERGED
REJECTED
```

This gives us an auditable duplicate-detection process.

---

# 12. Community Supports

When someone says:

> “আমিও এই সমস্যা দেখেছি।”

create:

```text
issue_supports
────────────────────────
id
issue_id
user_id
created_at
```

Unique constraint:

```text
(issue_id, user_id)
```

So one user cannot support the same issue repeatedly.

---

# 13. Status History

Do not only store:

```text
issues.status
```

You also need history.

```text
issue_status_history
────────────────────────
id
issue_id
from_status
to_status
changed_by
reason
created_at
```

Example:

```text
REPORTED
   ↓
UNDER_REVIEW
   ↓
VERIFIED
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
CLOSED
```

This enables the timeline shown to users and gives us an audit trail.

---

# 14. Teams

```text
teams
────────────────────────
id
name
department
area
is_active
created_at
updated_at
```

Example:

```text
Road Maintenance
Mymensingh Zone 3
```

---

# 15. Assignments

```text
assignments
────────────────────────
id
issue_id
team_id
assigned_by
priority
deadline
status
assigned_at
completed_at
```

Relationship:

```text
Issue
  │
  └── Assignment
          │
          └── Team
```

---

# 16. Notifications

```text
notifications
────────────────────────
id
user_id
type
title
message
data
read_at
created_at
```

Examples:

```text
REPORT_VERIFIED
ISSUE_ASSIGNED
ISSUE_RESOLVED
ISSUE_REOPENED
POSSIBLE_DUPLICATE
```

---

# 17. Entity Relationship Diagram

High-level:

```text
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │              │
                    ▼              ▼
                REPORTS       ISSUE_SUPPORTS
                    │              │
                    │              ▼
                    │           ISSUES
                    │              │
                    ▼              ├───────────────┐
                 MEDIA             │               │
                    │              ▼               ▼
                    │        ASSIGNMENTS    STATUS_HISTORY
                    │              │
                    │              ▼
                    │            TEAMS
                    │
                    ▼
              AI_ANALYSES
                    │
                    ▼
              ISSUE_MATCHES
```

---

# 18. Important Database Indexes

This project will depend heavily on indexes.

### Reports

Index:

```text
reports(user_id)
reports(status)
reports(created_at)
```

### Issues

Index:

```text
issues(category_id)
issues(status)
issues(severity)
issues(created_at)
```

### Spatial

Most importantly:

```text
GIST INDEX on location
```

Conceptually:

```text
CREATE INDEX issues_location_gist
ON issues
USING GIST(location);
```

This makes nearby-location queries efficient.

---

# 19. Duplicate Detection Query

The architecture should eventually support queries like:

```text
Find unresolved issues:

WHERE
distance(new_report.location, issue.location) < 500m

AND
issue.status NOT IN (
    'CLOSED',
    'REJECTED'
)
```

Then run image/text similarity on the candidate set.

This is much more efficient than comparing the new image against every image in the database.

---

# 20. Data Flow

The complete backend flow now looks like:

```text
Citizen
   │
   ▼
Next.js
   │
   ▼
Laravel API
   │
   ├──────────────► PostgreSQL/PostGIS
   │
   ├──────────────► Object Storage
   │
   └──────────────► Redis
                         │
                         ▼
                    AI Worker
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
             CV     Embeddings   Severity
              │          │          │
              └──────────┼──────────┘
                         ▼
                    Laravel
                         │
                         ▼
                 Duplicate Search
                         │
                         ▼
                 Issue / Report
                         │
                         ▼
                  Admin Workflow
                         │
                         ▼
                     Resolution
```

---

# 21. Recommended Final Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
Map library
```

## Backend

```text
Laravel
PHP
REST API
Laravel Queue
Laravel Notifications
```

## Database

```text
PostgreSQL
PostGIS
```

## Infrastructure

```text
Redis
Docker
Object Storage
Nginx
```

## AI

```text
Python
PyTorch
OpenCV
Transformers
Sentence Transformers
```

## Optional later

```text
WebSockets
Push Notifications
Background Workers
MLflow
Prometheus
Grafana
```

---

# 22. Development Strategy

Do not build everything simultaneously.

Build in layers.

### Phase 1 — Foundation

```text
Auth
Users
Roles
Database
Basic API
```

### Phase 2 — Core Reporting

```text
Create Report
Photo Upload
GPS
Report Details
My Reports
Status Tracking
```

### Phase 3 — Map

```text
PostGIS
Issue Map
Nearby Issues
Filters
```

### Phase 4 — Admin

```text
Dashboard
Moderation
Verification
Assignment
Status Management
```

### Phase 5 — AI

```text
Image Classification
Embeddings
Duplicate Detection
AI Severity
```

### Phase 6 — Intelligence

```text
Issue Clustering
Hotspot Detection
Priority Scoring
Analytics
```

### Phase 7 — Production Hardening

```text
Caching
Rate Limiting
Queues
Logging
Monitoring
Testing
Security
Docker
CI/CD
```

---

# 23. Final Vision

The finished system should feel like:

```text
                  BHAI EKTU DEKHEN 👀
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       CITIZENS           AI             AUTHORITY
          │                │                │
          │                │                │
       Reports        Classification      Review
          │          Embeddings           Verify
          │          Severity             Assign
          │          Duplicates           Resolve
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  CIVIC INTELLIGENCE
                           │
                           ▼
                    BETTER CITIES
```

The key idea is:

> **Don't build a complaint website. Build an intelligence layer on top of community-generated civic data.**

That is what gives **Bhai Ektu Dekhen** the potential to become a genuinely strong Full Stack + AI + System Design portfolio project.
