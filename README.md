💬 Chat App — Backend

A production-ready real-time chat backend built with Express.js, Socket.io, Prisma, and PostgreSQL. Supports 1-to-1 and group messaging with JWT authentication, typing indicators, online presence, and emoji reactions.

Tech Stack:
Layer	Technology
Runtime	Node.js + TypeScript
Framework	Express.js
Real-time	Socket.io
ORM	Prisma
Database	PostgreSQL
Auth	Custom JWT (Access + Refresh Token)
Validation	Zod
Upload	Cloudinary + Multer
Package Manager	pnpm

Features:
Auth
Register / Login with email + password
JWT access token + refresh token with rotation
Refresh token stored in httpOnly cookie — XSS safe
Logout with token revocation

User:
View own profile and other users
Update name, bio
Avatar upload via Cloudinary (old avatar auto-deleted)
Search users by name or email (paginated)
Online / offline status + last seen

Conversation:
1-to-1 private conversation (duplicate prevention)
Group chat with name and avatar
Add / remove members (admin only)
Leave group (auto admin transfer)
Unread message count per conversation
Mark conversation as read

Message:
Send text messages
Reply to a specific message (quoted reply)
Edit own message
Soft delete (content replaced, reply chain intact)
Cursor-based pagination (infinite scroll ready)
Emoji reactions (toggle — add/remove)
Group admin can delete any message
Real-time (Socket.io)
Instant message delivery
Typing indicator ("Sakib is typing...")
Online / offline presence
Message seen indicator (✓✓)
Real-time broadcast for edit, delete, reactions

