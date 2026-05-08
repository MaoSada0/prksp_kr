# PsychConnect

Платформа для онлайн-консультаций с психологами: поиск специалиста, запись на сессию, обмен сообщениями в реальном времени.

**Демо:** https://frontend-production-6189.up.railway.app/

---

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 17, Spring Security + JWT |
| База данных | PostgreSQL 16, JPA/Hibernate |
| Хранилище файлов | AWS S3 / MinIO (локально) |
| Реальное время | WebSocket (STOMP over SockJS) |
| API-документация | SpringDoc OpenAPI (Swagger UI) |
| Инфраструктура | Docker, Docker Compose, GitHub Actions, Railway |

---

## Архитектура

```
┌─────────────────────────────┐
│     React SPA (Nginx/Vite)  │
│         :3000 / :80         │
└────────────┬────────────────┘
             │ REST + WebSocket
┌────────────▼────────────────┐
│   Spring Boot API  :8080    │
│  ┌──────────────────────┐   │
│  │ Controllers (8)      │   │
│  │ Services (7)         │   │
│  │ JWT Security         │   │
│  │ WebSocket / STOMP    │   │
│  └──────────────────────┘   │
└────────┬──────────┬─────────┘
         │          │
  ┌──────▼──┐  ┌────▼───┐
  │Postgres │  │ MinIO  │
  │  :5432  │  │  :9000 │
  └─────────┘  └────────┘
```

Две роли пользователей: **PSYCHOLOGIST** и **CLIENT**.

- Психолог управляет профилем, услугами и слотами доступности.
- Клиент находит психологов, бронирует сессии, общается в чате и оставляет отзывы.

Схема БД включает 12 JPA-сущностей: `User`, `PsychologistProfile`, `PsychologistService`, `TimeSlot`, `Session`, `Review`, `Chat`, `Message` и др.

---

## Запуск локально

### Требования

- Docker и Docker Compose

### Запуск

```bash
git clone <repo-url>
cd kr
docker-compose up
```

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |

### Разработка без Docker

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Vite-сервер проксирует `/api` и `/ws` на `localhost:8080`.

---

## Тесты

**Backend** (JUnit 5, Spring Test):
```bash
cd backend
mvn test
```

Тесты покрывают сервисы: `AuthService`, `PsychologistService`, `SessionService`, `ReviewService`, `JwtUtil`.

**Frontend** (Vitest, React Testing Library):
```bash
cd frontend
npm run test:run
```

Тесты охватывают компоненты и API-клиенты.

**CI/CD:** GitHub Actions запускает оба набора тестов на каждый пуш в `main` и деплоит на Railway при успехе.
