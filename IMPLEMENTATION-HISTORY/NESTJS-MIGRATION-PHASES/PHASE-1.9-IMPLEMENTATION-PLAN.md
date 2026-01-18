# Phase 1.9 - Comment Module Implementation Plan

**Date:** 15 de Janeiro de 2026
**Status:** 🟡 In Progress
**Module:** CommentModule (Comment and Discussion Management)

---

## 📋 Overview

Implement the **CommentModule** for managing comments and discussions on certification processes.

### Key Features:
- Comments on processes (internal and external)
- User mentions (@user)
- Edit/delete own comments
- Internal notes vs client-visible comments
- Mention notifications

---

## 🎯 Prisma Schema Analysis

### Comment Model
```prisma
model Comment {
  id         String    @id @default(dbgenerated("uuid_generate_v4()"))
  processId  String    @map("process_id")
  userId     String    @map("user_id")
  content    String    @db.Text
  mentions   String[]  @default([]) // Array of user IDs mentioned
  isInternal Boolean   @default(false) @map("is_internal") // Internal notes vs visible to client
  editedAt   DateTime? @map("edited_at")
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  process Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  user    User    @relation("CommentAuthor", fields: [userId], references: [id])
}
```

**No enums** - Simple model with boolean flag for internal comments.

---

## 📦 Implementation Components

### 1. DTOs (3 DTOs)

#### create-comment.dto.ts
```typescript
- processId: string
- content: string (min 1 char)
- mentions?: string[] (array of user IDs)
- isInternal?: boolean (default: false)
```

#### update-comment.dto.ts
```typescript
- content?: string (min 1 char)
- mentions?: string[]
- isInternal?: boolean
```

#### comment-filters.dto.ts
```typescript
- processId?: string
- userId?: string
- isInternal?: boolean
- mentioned?: string (user ID to filter by mentions)
- skip?: number
- take?: number
```

### 2. Service Methods (8 methods)

#### CRUD Operations
- `create(userId: string, dto: CreateCommentDto): Promise<Comment>` - Create comment
- `update(id: string, userId: string, dto: UpdateCommentDto): Promise<Comment>` - Update own comment
- `delete(id: string, userId: string): Promise<void>` - Delete own comment
- `findById(id: string): Promise<Comment>` - Get by ID
- `findByProcessId(processId: string, includeInternal: boolean): Promise<Comment[]>` - Get comments for process

#### Query Operations
- `findByMention(userId: string, limit?: number): Promise<Comment[]>` - Get comments where user is mentioned
- `findByUser(userId: string, limit?: number): Promise<Comment[]>` - Get comments by user
- `findAll(filters: CommentFiltersDto): Promise<{ data: Comment[], total: number }>` - List with filters

### 3. Controller Endpoints (8 endpoints)

#### CRUD Endpoints
- `POST /comments` - Create comment (all authenticated users)
- `PATCH /comments/:id` - Update comment (own comments only)
- `DELETE /comments/:id` - Delete comment (own comments only)
- `GET /comments/:id` - Get by ID (all authenticated users)
- `GET /comments/process/:processId` - Get by process (all authenticated users)

#### Query Endpoints
- `GET /comments/mentions/me` - Get comments where I'm mentioned (current user)
- `GET /comments/user/:userId` - Get comments by user (all authenticated users)
- `GET /comments` - List with filters (analista, gestor, admin)

---

## 🧪 Testing Strategy

### Test Coverage (Target: 20+ tests)

#### CRUD Tests (8 tests)
- Create comment successfully
- Create comment - process not found
- Update own comment successfully
- Update comment - not owner (should fail)
- Update comment - not found
- Delete own comment successfully
- Delete comment - not owner (should fail)
- Delete comment - not found

#### Query Tests (6 tests)
- Find by ID - found/not found
- Find by process ID
- Find by process ID - filter internal comments
- Find by mention
- Find by user
- Find all with filters

#### Business Rules Tests (6 tests)
- Only comment owner can update
- Only comment owner can delete
- isInternal flag filtering works
- Mentions array is properly stored
- editedAt is set when comment is edited
- Content validation (minimum length)

---

## 📝 Implementation Notes

### Differences from Fastify Version

**Removed Features (Simplified):**
- RequestId/ProcessId dual lookup (schema uses processId directly)

**Kept Core Features:**
- Complete CRUD operations
- User mentions
- Internal vs external comments
- Edit tracking (editedAt)
- Ownership validation

### Business Rules

1. **Creation:**
   - Process must exist
   - Content minimum 1 character
   - isInternal defaults to false
   - mentions can be empty array

2. **Update:**
   - Only comment owner can update
   - Sets editedAt to current timestamp
   - Can update content, mentions, and isInternal flag

3. **Delete:**
   - Only comment owner can delete
   - Comment is permanently deleted (no soft delete)

4. **Visibility:**
   - isInternal = true: Only visible to analysts, gestors, admins
   - isInternal = false: Visible to everyone including company users

5. **Mentions:**
   - mentions is an array of user IDs
   - Used for notification purposes
   - Can mention multiple users in a single comment

---

## ✅ Completion Criteria

- [ ] 3 DTOs created and validated
- [ ] CommentService with 8 methods
- [ ] CommentController with 8 endpoints
- [ ] CommentModule created and registered
- [ ] 20+ unit tests (100% passing)
- [ ] Build passing without errors
- [ ] Ownership validation working
- [ ] Internal comment filtering working

---

## 🚀 Next Steps After Completion

Phase 1.10 will implement **AuditorAllocationModule** for assigning auditors to processes.

---

**Implementation Start:** 15/01/2026
**Expected Completion:** Same day
**Estimated LOC:** ~750 lines
