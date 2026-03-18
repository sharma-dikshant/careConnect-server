# CareConnect Server — API Documentation

> **Base URL:** `http://localhost:3000`
> **Auth:** All protected routes require `Authorization: Bearer <token>` header.

---

## Response Envelope

Every endpoint returns a consistent envelope:

```json
{
  "message": "Human-readable status message",
  "data": { }
}
```

`data` may be `null` on error/not-found cases.

---

## Pagination

Paginated responses return:

```json
{
  "message": "...",
  "data": {
    "items": [ ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

---

## 1. Auth

### `POST /api/auth/signup/doctor`

Register a new doctor account.

**Request Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | |
| `email` | string | ✅ | Unique |
| `password` | string | ✅ | Min 6 chars |
| `phone` | string | ✅ | Unique, max 10 chars |
| `address` | string | ✅ | |
| `designation` | string | ✅ | |
| `license` | string | ✅ | |
| `specialization` | string | ✅ | |
| `experience` | integer | ❌ | Years |
| `bio` | string | ✅ | |
| `hospital` | string | ✅ | |

**Success `200`**

```json
{
  "message": "signed up",
  "data": {
    "token": "<jwt>",
    "type": "Bearer"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `user with this email or phone already exists` |
| `500` | `failed to create account` |

---

### `POST /api/auth/signup/patient`

Register a new patient account.

**Request Body**

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `email` | string | ✅ |
| `password` | string | ✅ Min 6 chars |

**Success `200`**

```json
{
  "message": "signed up",
  "data": {
    "token": "<jwt>",
    "type": "Bearer"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `user with this email already exists` |
| `500` | `failed to create account` |

---

### `POST /api/auth/login`

Login as a doctor or patient.

**Request Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"doctor"` \| `"patient"` | ✅ | |
| `email` | string | ✅ | |
| `password` | string | ✅ | |

**Success `200`**

```json
{
  "message": "logged in",
  "data": {
    "token": "<jwt>",
    "type": "Bearer"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Invalid login type` |
| `400` | `incorrect password` |
| `403` | `No doctor exist with given email id` |
| `403` | `No patient exist with given email id` |

---

### `POST /api/auth/logout`

Invalidates the session (client-side token discard).

**Success `200`**

```json
{
  "message": "logged out",
  "data": {
    "token": "invalid",
    "type": "Bearer"
  }
}
```

---

## 2. Users 🔒

> All routes require JWT.

### `GET /api/users`

Get the profile of the currently logged-in user.

**Success `200` — Doctor**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "designation": "Cardiologist",
    "license": "LIC-001",
    "specialization": "Cardiology",
    "experience": 10,
    "bio": "...",
    "hospital": "City Hospital",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Success `200` — Patient**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `200` | `Doctor not found` (data: null) |
| `200` | `Patient not found` (data: null) |

---

### `PATCH /api/users/me`

Update the current user's profile. Fields depend on the caller's role.

**Request Body — Doctor**

| Field | Type | Required |
|---|---|---|
| `name` | string | ❌ |
| `phone` | string | ❌ |
| `address` | string | ❌ |
| `designation` | string | ❌ |
| `license` | string | ❌ |
| `specialization` | string | ❌ |
| `experience` | integer | ❌ |
| `bio` | string | ❌ |
| `hospital` | string | ❌ |

**Request Body — Patient**

| Field | Type | Required |
|---|---|---|
| `name` | string | ❌ |

**Success `200`**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Name",
    "email": "...",
    ...
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `200` | `Doctor not found` (data: null) |
| `200` | `Patient not found` (data: null) |
| `200` | `Invalid user role` (data: null) |

---

### `GET /api/users/search`

Search users by role and/or email with pagination.

**Query Parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `role` | `"doctor"` \| `"patient"` | ❌ | Omit for both |
| `email` | string | ❌ | Partial, case-insensitive |
| `page` | number | ❌ | Default: 1 |
| `limit` | number | ❌ | Default: 10, max: 100 |

**Success `200`**

```json
{
  "message": "Users retrieved successfully",
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "id": 1,
        "name": "Dr. Smith",
        "email": "smith@example.com",
        "designation": "Cardiologist",
        "specialization": "Cardiology",
        "hospital": "City Hospital",
        "active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "role": "doctor"
      }
    ]
  }
}
```

---

### `GET /api/users/doctors/:doctorId`

Get a doctor's public profile by ID.

**Path Params:** `doctorId` — integer

**Success `200`**

```json
{
  "message": "Doctor fetched successfully",
  "data": {
    "id": 1,
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "designation": "Cardiologist",
    "license": "LIC-001",
    "specialization": "Cardiology",
    "experience": 10,
    "bio": "...",
    "hospital": "City Hospital",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `200` | `Doctor not found` (data: null) |

---

### `GET /api/users/patients/:patientId`

Get a patient's profile by ID.

**Path Params:** `patientId` — integer

**Success `200`**

```json
{
  "message": "Patient fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `200` | `Patient not found` (data: null) |

---

## 3. Appointments 🔒

> All routes require JWT.

### `POST /api/appointments`

Create a new appointment. **Doctor only.**

**Request Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `patientEmail` | string | ✅ | Must be a registered patient |
| `title` | string | ✅ | |
| `description` | string | ❌ | |

**Success `200`**

```json
{
  "message": "Appointment created successfully",
  "data": {
    "id": 1,
    "title": "Initial Consultation",
    "description": "First visit",
    "patient": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `403` | `Only doctors can create appointments` |
| `404` | `Patient not found with this email` |
| `500` | `Failed to create appointment` |

---

### `GET /api/appointments`

Get all appointments for the current user. Automatically filters by role:
- **Doctor** → returns appointments where they are the doctor
- **Patient** → returns appointments where they are the patient

**Query Parameters**

| Param | Type | Required | Default |
|---|---|---|---|
| `page` | number | ❌ | 1 |
| `limit` | number | ❌ | 20 |

**Success `200` — Doctor view**

```json
{
  "message": "Appointments retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Initial Consultation",
        "description": "First visit",
        "patient": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "total_pages": 1
    }
  }
}
```

**Success `200` — Patient view**

```json
{
  "message": "Appointments retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Initial Consultation",
        "description": "First visit",
        "doctor": {
          "id": 1,
          "name": "Dr. Smith",
          "email": "smith@example.com",
          "specialization": "Cardiology"
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": { ... }
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `500` | `Failed to retrieve appointments` |

---

### `PATCH /api/appointments/:appointmentId`

Update the title and/or description of an appointment. **Doctor only, and only for appointments they own.**

**Path Params:** `appointmentId` — integer

**Request Body**

| Field | Type | Required |
|---|---|---|
| `title` | string | ❌ |
| `description` | string | ❌ |

**Success `200`**

```json
{
  "message": "Appointment updated successfully",
  "data": {
    "id": 1,
    "title": "Follow-up Consultation",
    "description": "Updated notes",
    "patient": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `404` | `Appointment not found` |
| `403` | `You are not the doctor for this appointment` |

---

### `DELETE /api/appointments/:appointmentId`

Soft-delete an appointment (sets `active = false`). **Doctor only, and only for appointments they own.**

**Path Params:** `appointmentId` — integer

**Success `200`**

```json
{
  "message": "Appointment deleted successfully",
  "data": null
}
```

**Errors**

| Status | Message |
|---|---|
| `404` | `Appointment not found` |
| `403` | `You are not the doctor for this appointment` |

---

## 4. Messages 🔒

> All routes require JWT.

### `POST /api/messages/appointments/:appointmentId`

Send a message in an appointment (triggers a bot reply). **Patient only.**

The patient's message and the bot's AI-generated reply are both saved and the bot reply is returned.

**Path Params:** `appointmentId` — integer

**Request Body**

| Field | Type | Required |
|---|---|---|
| `message` | string | ✅ |

**Success `200`**

```json
{
  "message": "success",
  "data": {
    "message": "Bot AI-generated reply text"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `404` | `no appointment with id: {id}` |
| `500` | `failed to send message` |

---

### `GET /api/messages/appointments/:appointmentId`

Get all messages for an appointment. Accessible by **both the doctor and patient** in the appointment.

**Path Params:** `appointmentId` — integer

**Query Parameters**

| Param | Type | Required | Default |
|---|---|---|---|
| `page` | number | ❌ | 1 |
| `limit` | number | ❌ | 20 |

**Success `200`**

```json
{
  "message": "Messages retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "appointment_id": 1,
        "sender": "patient",
        "message": "I have a headache",
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "appointment_id": 1,
        "sender": "bot",
        "message": "Based on your symptoms...",
        "created_at": "2024-01-01T00:00:01.000Z"
      }
    ],
    "meta": {
      "total": 2,
      "page": 1,
      "limit": 20,
      "total_pages": 1
    }
  }
}
```

**Sender values:** `"patient"` | `"bot"`

**Errors**

| Status | Message |
|---|---|
| `404` | `No appointment with id: {id}` |
| `403` | `You do not have access to this appointment` |
