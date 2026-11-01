# Online Examination & Assignment Management System

<p align="left">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

A full-stack, secure digital examination and assignment management portal designed for educational institutions. Built with **React 19**, **Firebase**, and **Cloudinary**, powered by **Groq AI** for automated question generation, with real-time **anti-cheat proctoring**.

---

## Key Features

### Teacher Features
- **AI-Powered Exam Creation**: Generate custom multiple-choice question (MCQ) exams instantly using Groq API (`qwen/qwen3.8-27b`) based on topic, subject, question count, and difficulty.
- **Excel Batch Upload**: Import bulk exam questions directly via `.xlsx` spreadsheets with customizable marks per question.
- **Exam Management**: View, activate/deactivate, edit, and delete scheduled exams.
- **Assignment System**: Create assignments with deadlines, instructions, and file criteria.
- **Submission Evaluation & Resubmission**: View student submissions, grade work, leave feedback, and request resubmissions for incomplete or invalid files.
- **Analytics & Results**: Review real-time exam performance, score distributions, and individual student attempt details.

### Student Features
- **Filtered Available Exams**: Automatically filters out already completed tests so students only see tests they are eligible to take.
- **Proctored Exam Interface**: Distraction-free test environment with a countdown timer and question navigator.
- **3-Strike Anti-Cheat Engine**: Real-time tab-switching and window-blur detection:
  - Strike 1: Initial warning.
  - Strike 2: Final warning.
  - Strike 3: Instant auto-submission of the exam.
- **Immediate Results**: View scores, percentage, and detailed answer keys right after submitting.
- **Assignment Hub**: Upload PDF and image submissions to Cloudinary, track grading status, and resubmit when requested by teachers.

---

## Tech Stack

| Category | Technology | Badges / Icons |
|---|---|---|
| **Frontend** | React 19, Vite, React Router v7, React Hot Toast, Lucide Icons | <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" /> |
| **Authentication & Database** | Firebase Authentication, Cloud Firestore | <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" /> |
| **Media Storage** | Cloudinary (Direct unsigned upload for assignments) | <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white" /> |
| **AI Integration** | Groq Cloud API (`qwen/qwen3.8-27b`) | <img src="https://img.shields.io/badge/Groq-F55036?style=flat-square&logo=groq&logoColor=white" /> |
| **Spreadsheet Parsing** | XLSX (SheetJS) | <img src="https://img.shields.io/badge/SheetJS-43B02A?style=flat-square&logo=excel&logoColor=white" /> |
| **Hosting & CI/CD** | Vercel | <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" /> |

---

## Project Structure

```text
Online-Examination-System/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Navbar, Sidebar, Layouts)
│   ├── firebase/           # Firebase client setup, auth functions, Firestore queries, Cloudinary upload
│   ├── pages/
│   │   ├── Landing.jsx     # Role selection landing page
│   │   ├── StudentLogin.jsx# Student authentication
│   │   ├── TeacherLogin.jsx# Teacher authentication
│   │   ├── student/        # Student dashboard, exams, anti-cheat exam runner, assignments, results
│   │   └── teacher/        # Teacher dashboard, AI exam creator, assignments, grading, submissions
│   ├── utils/              # AI helper functions (Groq API integrations)
│   ├── App.jsx             # Route definitions & global session state
│   ├── main.jsx            # React root mount
│   └── index.css           # Global application styles
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- Firebase project credentials
- Cloudinary account (for assignment upload preset)
- Groq Cloud API key (for AI question generation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rajesh-dev-stack/Online-Examination-System.git
   cd Online-Examination-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id

   # Groq AI API Key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Anti-Cheat & Security Considerations

- **Tab Switching Detection**: Listens to browser `visibilitychange` and `blur` events with action locks to prevent false positives when interacting with system confirmation modals.
- **Session Protection**: Firebase session persistence synchronization ensures stale local states are cleared on logout.
- **Protected Redirection**: Declarative redirects keep authenticated teachers and students from entering auth trap loops.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
