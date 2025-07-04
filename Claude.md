# Project Overview - Chat App

This is a real-time Chat Application consisting of two main parts:

- **Backend**: Built with Spring Boot (Java 17), providing REST APIs and WebSocket communication.
- **Frontend**: Built with Next.js 14, TypeScript, TailwindCSS, and Shadcn UI for the interface. The frontend connects to the backend via WebSocket for real-time messaging.

## Key Requirements

- The backend and frontend are organized as separate projects within this repository.
- Communication between frontend and backend uses WebSocket with a dedicated `/chat` endpoint.
- Clean code, security best practices, and scalability are priorities across the entire project.
- The frontend UI must be modern, responsive, and consistent, leveraging pre-defined components where possible.

## Technology Summary

| Part      | Technology |
|-----------|------------|
| Backend   | Spring Boot 3, Java 17, WebSocket (STOMP), REST API |
| Frontend  | Next.js 14, TypeScript, TailwindCSS, Shadcn UI |

AI (Claude) should respect the structure and responsibilities of each project part and avoid mixing backend and frontend logic unless explicitly requested.
