# Student of the Year

A web platform to track and reward student achievements across academics, sports, cultural, technical, and social activities. Built with **FastAPI**, **React**, **Tailwind CSS**, and **PostgreSQL** (or SQLite).  

---

## 🚀 Features

- **User Authentication**
  - Admins and Students with role-based access
  - Secure login using hashed passwords and JWT tokens
- **Student Management**
  - Add, update, delete, and view students
  - Associate students with departments
- **Points & Achievements**
  - Track points for events, milestones, and certificates
  - View total points, breakdowns, and timelines
  - Filter achievements by category
- **Dashboard**
  - See top students and overall rankings
  - Detailed student profiles
- **Responsive UI**
  - Built with React and Tailwind CSS
  - Works across desktop and mobile devices


---

## ⚡ Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic  
- **Frontend:** React, Tailwind CSS, React Router  
- **Database:** PostgreSQL / SQLite  
- **Authentication:** JWT tokens, bcrypt password hashing  

---

## 🛠️ Setup Instructions

### Backend and Frontend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend

cd frontend
npm install
npm run dev


