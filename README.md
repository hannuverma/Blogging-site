# Blogging Site

A full-stack blogging application built with modern web technologies. This project features a React + Vite frontend with Tailwind CSS styling and a Django backend API.

**Live Demo:** https://blogging-site-phi-two.vercel.app

## Project Structure

```
Blogging-site/
├── Frontend/          # React + Vite frontend application
├── Backend/           # Django REST API backend
├── main.py            # Root Python entry point
├── pyproject.toml     # Python project configuration
└── README.md          # This file
```

## Frontend

A modern React application built with Vite for fast development and optimized production builds.

- **Framework:** React 19.2 + Vite
- **Styling:** Tailwind CSS 4.2
- **Routing:** React Router DOM 7.13
- **HTTP Client:** Axios
- **Authentication:** Google OAuth integration
- **Animations:** Lottie animations & Motion
- **UI Components:** Lucide React icons

### Getting Started

```bash
cd Frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

For detailed Frontend setup, see [Frontend/README.md](./Frontend/README.md)

## Backend

A Django REST Framework API providing blog post management and user authentication.

- **Framework:** Django with Django REST Framework
- **Database:** SQLite (default)
- **Authentication:** Google OAuth support
- **Image Handling:** Post image management

### Getting Started

```bash
cd Backend
python manage.py migrate      # Apply database migrations
python manage.py runserver    # Start development server
```

For detailed Backend setup, see [Backend/README.md](./Backend/README.md)

## Environment Variables

### Frontend (`Frontend/.env`)
```
VITE_API_URL=your_backend_api_url
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Backend
Configure Django settings in `Backend/Backend/settings.py`

## Features

- 📝 Create, read, update, and delete blog posts
- 🔐 Google OAuth authentication
- 🎨 Responsive design with Tailwind CSS
- 🚀 Fast development with Vite
- 📱 Mobile-friendly interface
- 🖼️ Post image uploads

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, Tailwind CSS, React Router |
| **Backend** | Django, Django REST Framework |
| **Database** | SQLite (configurable) |
| **Deployment** | Vercel (Frontend) |
| **Authentication** | Google OAuth 2.0 |

## Development

### Prerequisites

- Node.js 16+ and npm
- Python 3.13+
- Git

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/hannuverma/Blogging-site.git
   cd Blogging-site
   ```

2. **Start the Backend**
   ```bash
   cd Backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Start the Frontend** (in another terminal)
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Build & Deployment

### Frontend
The frontend is deployed on Vercel and automatically builds from the `main` branch.

```bash
npm run build
```

### Backend
See [Backend/README.md](./Backend/README.md) for deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Hannu Verma** - [GitHub Profile](https://github.com/hannuverma)

---

For more information, check the individual README files in the Frontend and Backend directories.
