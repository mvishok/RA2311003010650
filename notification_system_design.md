# Notification System Design

## 1. Overview

A backend system to send notifications for upcoming vehicle maintenance schedules.
Users receive reminders before the scheduled service date.

---

## 2. Components

* **Backend API**

  * Handles vehicle and service data
  * Triggers notification events

* **Scheduler (Cron Job)**

  * Runs periodically (e.g., every day)
  * Checks upcoming services

* **Notification Service**

  * Sends notifications (email/SMS/push)

* **Queue (Optional for scaling)**

  * Stores notification jobs (Redis/Kafka)

---

## 3. Flow

1. User schedules a service (`POST /services`)
2. Data is stored in backend
3. Scheduler runs daily
4. Finds services due soon (e.g., next 2 days)
5. Pushes jobs to queue (or directly sends)
6. Notification service sends alerts to users

---

## 4. Retry Mechanism

* Failed notifications are retried
* Use exponential backoff (e.g., 1 min to 5 min to 15 min)
* Max retry limit (e.g., 3 attempts)

---

## 5. Scaling

* Use queue system (Redis/Kafka) to handle high load
* Multiple workers consume jobs
* Stateless backend → easy horizontal scaling

---

## 6. Failure Handling

* Log all failures using logging middleware
* Store failed jobs for later retry
* Prevent duplicate notifications using unique IDs

---

## Output Screenshots

![Post Vehicles](/screenshots/post%20vehicles.png)

![Post Services](/screenshots/post%20services.png)

![Get Services](/screenshots/get%20services.png)

---

# BACKEND TASKS

---

## Stage 1

### Core Actions
- Create notification
- Get notifications (user)
- Mark as read
- Get unread count

### APIs

#### POST /notifications
Request:
{
  "userId": "string",
  "type": "Event | Result | Placement",
  "message": "string"
}

Response:
{
  "id": "string",
  "status": "created"
}

---

#### GET /notifications?userId=
Response:
[
  {
    "id": "...",
    "type": "...",
    "message": "...",
    "isRead": false,
    "createdAt": "..."
  }
]

---

#### PATCH /notifications/:id/read
Response:
{
  "status": "updated"
}

---

#### GET /notifications/unread/count?userId=
Response:
{
  "count": 5
}

---

### Real-time
- Use WebSockets / SSE
- Push new notifications instantly

---

## Stage 2

### DB Choice
PostgreSQL (structured + indexing)

### Schema

Table: notifications
- id (UUID)
- userId (string, indexed)
- type (enum)
- message (text)
- isRead (boolean, indexed)
- createdAt (timestamp, indexed)

### Problems at scale
- Slow queries
- Large table scans

### Solutions
- Indexing (userId, isRead, createdAt)
- Pagination
- Partitioning by date

### Sample Query
SELECT * FROM notifications
WHERE userId = '123' AND isRead = false
ORDER BY createdAt DESC;

---

## Stage 3

### Problem
Query will scan large dataset, it will be slower

### Fix
we should create composite index on the basis of most frequent queries
(userId, isRead, createdAt DESC)

### should not index everything because
- High write cost
- Storage overhead

### Optimized Query
SELECT * FROM notifications
WHERE userId = 1042 AND isRead = false
ORDER BY createdAt DESC;

### Cost
O(log n) with index

### Placement Query
SELECT DISTINCT userId
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';

---

## Stage 4

### Problem
DB overloaded due to frequent fetch

### Solutions
- Cache (Redis)
- Pagination / limit
- Lazy loading

### Tradeoffs
- Cache = stale data risk
- WebSockets = infra complexity, cost

---

## Stage 5

### Problems
- Sequential processing
- No retry
- Failure breaks flow

### Fix
- Use queue (Kafka/Redis)
- Async processing
- Retry mechanism

### Improved Flow
- Push jobs to queue
- Worker sends email + saves DB
- Retry on failure

### Pseudocode
enqueue(notification)

worker:
  send_email()
  save_db()
  push_realtime()

---

## Stage 6

Implemented priority notification system using weighted scoring:
- Placement > Result > Event
- Sorted by recency

Approach:
- Fetch notifications from API
- Assign weight
- Sort using score
- Return top 10

Time Complexity:
O(n log n)

### Screenshot

![Stage 6](/screenshots/stage%206.png)