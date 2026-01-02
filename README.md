# TMF Marketplace Frontend

Next.js frontend for TMF Marketplace - A stock photography platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Pages

- `/auth/login` - User login
- `/auth/register` - User registration with role selection
- `/uploader/dashboard` - View uploaded photos
- `/uploader/upload` - Upload new photos
- `/uploader/photos/[id]/edit` - Add/edit photo metadata
- `/buyer/gallery` - Browse and download photos

