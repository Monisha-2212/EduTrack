# EduTrack - Academic Assignment Platform

EduTrack is a modern, real-time academic platform designed for faculty and students to manage assignments, submissions, and grading with ease.

## ✨ Features
- **📊 Interactive Dashboards:** Role-specific views for students and faculty.
- **🚀 Real-time Notifications:** Instant alerts for new assignments, submissions, and grades via Socket.io.
- **📁 Secure Submissions:** Drag-and-drop file uploads integrated with Cloudinary.
- **📝 Seamless Grading:** Dedicated faculty suite for reviewing and feedback.
- **🔒 Role-Based Security:** Protected routes and strict endpoint authorization.

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query, Zustand, Sonner, Lucide.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Multer, Cloudinary, JWT.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (for database)
- Cloudinary account (for file storage)

### Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd EduTrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Fill in your MongoDB URI, JWT secret, Cloudinary credentials, and Client URL.
   - **⚠️ SECURITY WARNING:** Never commit `.env` to version control. It's already in `.gitignore`.

4. **Run the application:**
   - **Development (Both Client & Server):**
     ```bash
     npm run dev:full
     ```
   - **Production:**
     ```bash
     npm run build
     npm start
     ```

## 🚀 Deployment

### Prerequisites for Deployment:
- MongoDB Atlas account with database created
- Cloudinary account for file storage
- Hosting platform (Render, Vercel, Heroku, etc.)

### Environment Variables Setup:
**CRITICAL:** Set these as environment variables in your hosting platform - NEVER commit real credentials to code.

Required Variables:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong secret key (min 32 characters)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `CLIENT_URL` - Your production frontend URL (e.g., `https://yourapp.com`)
- `NODE_ENV` - Set to `production`

### Render.com Deployment:

1. **Create a Web Service** on Render.
2. **Settings:**
   - **Build Command:** `npm run build`
   - **Start Command:** `node backend/server.js`
3. **Environment Variables:**
   - Add all required variables listed above
   - Set `NODE_ENV` to `production`
   - Update `CLIENT_URL` to your Render domain

### Security Checklist:
- [ ] `.env` file is in `.gitignore`
- [ ] No credentials committed to repository
- [ ] Environment variables set in hosting platform
- [ ] Database allows connections from deployment IP
- [ ] HTTPS enabled in production
- [ ] CORS configured for production domain

## 📜 License
MIT
