# DevLog Server

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up MongoDB (local or Atlas) and update `.env` with your connection string.
3. Start the server:
   ```sh
   node index.js
   ```

## API Endpoints
- `GET /api/logs` - List all logs
- `POST /api/logs` - Create a new log
- `PUT /api/logs/:id` - Update a log
- `DELETE /api/logs/:id` - Delete a log

## Frontend Integration
- Connect your frontend to `http://localhost:5000/api/logs` for CRUD operations.
- Enable CORS for cross-origin requests.

---

Update `.env` for production use and secure credentials as needed.
