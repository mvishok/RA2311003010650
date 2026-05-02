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
* Use exponential backoff (e.g., 1 min → 5 min → 15 min)
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

