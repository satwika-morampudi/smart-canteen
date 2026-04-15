# 🍽️ Smart Canteen — QR-Based Ordering System with Smart Recommendations

A full-stack QR-based canteen ordering system built with the MERN stack. 
Students scan a QR code to browse the menu, place orders, and track them in real time. 
Canteen staff manage everything from a dedicated admin dashboard.


# 📌 Table of Contents

Features
Tech Stack
System Architecture
Getting Started
Environment Variables
API Endpoints
Project Structure
Screenshots
Future Improvements

## ✨ Features

### Student Interface
- 📱 QR code scan access — no login required
- 🔍 Search, filter by category, and sort menu items
- 🛒 Cart with quantity controls and special notes per item
- 💳 Fake online payment flow (UPI / Card / Wallet demo)
- 💵 Pay at counter option
- 📋 Order confirmation with unique Order ID
- ⏱️ Live countdown timer for estimated wait time
- 📍 Real-time order tracking (Pending → In Progress → Ready → Delivered)
- ⭐ Star rating and feedback after delivery
- 🔁 Order history with one-click reorder
- 🤖 AI chatbot powered by Gemini API for food suggestions
- 🥗 Diet filter (Diabetic, Vegan, Low Calorie, High Protein)
- 🍽️ Time-based menu suggestions (breakfast/lunch/snacks/dinner)
- 🎯 Popular combo meal suggester

### Admin Dashboard
- 🔐 Secure JWT authentication
- 📋 Real-time order management with status filters
- ✅ Update order status (Pending → In Progress → Ready → Delivered)
- 💰 Mark counter orders as paid
- 🍳 Smart batch cooking system — group orders and complete together
- 🖼️ Menu management — add, edit, delete items with image URLs
- 📊 Analytics — revenue, top items, ratings, order breakdown
- 📷 QR code generator for each table — downloadable as PNG
- 🖥️ Live kitchen display screen at `/kitchen`
- 📥 CSV revenue export for daily reports
- 📝 View special notes per order item

---

## 🛠️ Tech Stack

| Layer          | Technology                           |
|----------------|--------------------------------------|
| Frontend       | React.js, Tailwind CSS, React Router |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB Atlas (Mongoose ODM)         |
| Real-time      | Socket.io (WebSockets)               |
| Authentication | JWT + bcryptjs                       |
| AI Integration | Google Gemini API                    |
| QR Code        | qrcode.react                         |
| Deployment     | Vercel (frontend) + Render (backend) |

---

## 🏗️ System Architecture

```
┌─────────────────┐     REST API      ┌──────────────────┐     Mongoose     ┌─────────────────┐
│  React Frontend │ ────────────────► │  Express Backend │ ───────────────► │  MongoDB Atlas  │
│  (Vercel)       │ ◄──────────────── │  (Render)        │                  │  5 Collections  │
└─────────────────┘     JSON Data     └──────────────────┘                  └─────────────────┘
         │                                     │
         │         WebSocket (Socket.io)       │
         └─────────────────────────────────────┘
                   Real-time order updates

External Services:
  Google Gemini API  ──►  AI Chatbot (via backend proxy)
  Vercel             ──►  React frontend hosting
  Render             ──►  Node.js backend hosting
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Git

### Clone the repository

```bash
git clone https://github.com/your-username/smart-canteen.git
cd smart-canteen
```

### Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/smart-canteen
JWT_SECRET=your_jwt_secret_key
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### Setup Frontend

```bash
cd client
npm install
```

Create `client/src/config.js`:

```javascript
const CONFIG = {
  API_URL: 'http://localhost:5000/api',
  SOCKET_URL: 'http://localhost:5000',
  APP_URL: 'http://localhost:3000',
};
export default CONFIG;
```

Start the React app:

```bash
npm start
```

App runs at `http://localhost:3000`

### Create Admin Account

```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin","email":"admin@canteen.com","password":"admin123"}'
```

Admin dashboard: `http://localhost:3000/admin`

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable         | Description                          |
|------------------|--------------------------------------|
| `MONGO_URI`      | MongoDB connection string            |
| `JWT_SECRET`     | Secret key for JWT signing           |
| `PORT`           | Server port (default 5000)           |
| `GEMINI_API_KEY` | Google Gemini API key for AI chatbot |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description              | Access |
|--------|--------------------|--------------------------|---------|
| POST | `/api/auth/register` | Create admin account     | Public |
| POST | `/api/auth/login`    | Admin login, returns JWT | Public |
| POST | `/api/auth/ai-chat`  | AI chatbot via Gemini    | Public |

### Menu
| Method | Endpoint | Description | Access |
|--------|-----------|------------|---------|
| GET | `/api/menu` | Get all menu items | Public |
| POST | `/api/menu` | Add new item | Admin |
| PUT | `/api/menu/:id` | Update item | Admin |
| DELETE | `/api/menu/:id` | Delete item | Admin |

### Orders
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place new order | Public |
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get order by ID | Public |
| GET | `/api/orders/kitchen` | Active orders for kitchen | Public |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| PUT | `/api/orders/:id/pay` | Mark order as paid | Admin |

### Batches
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/batches` | Create new batch | Admin |
| GET | `/api/batches` | Get all batches | Admin |
| PUT | `/api/batches/:id/complete` | Complete batch | Admin |

### Feedback
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/feedback` | Submit feedback | Public |
| GET | `/api/feedback` | Get all feedback | Admin |

---

## 📁 Project Structure

```
smart-canteen/
├── client/                          # React frontend
│   └── src/
│       ├── api/
│       │   └── api.js               # All Axios API calls
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── DietFilter.jsx
│       │   └── AIChatbot.jsx
│       ├── context/
│       │   ├── CartContext.jsx
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── student/
│       │   │   ├── MenuPage.jsx
│       │   │   ├── CartPage.jsx
│       │   │   ├── PaymentPage.jsx
│       │   │   ├── OrderConfirmation.jsx
│       │   │   ├── OrderTracking.jsx
│       │   │   └── OrderHistory.jsx
│       │   └── admin/
│       │       ├── AdminLogin.jsx
│       │       ├── AdminDashboard.jsx
│       │       └── tabs/
│       │           ├── OrdersTab.jsx
│       │           ├── BatchesTab.jsx
│       │           ├── MenuTab.jsx
│       │           ├── AnalyticsTab.jsx
│       │           └── QRTab.jsx
│       └── config.js                # API URLs config
│
└── server/                          # Node.js backend
    ├── models/
    │   ├── User.js
    │   ├── Menu.js
    │   ├── Order.js
    │   ├── Batch.js
    │   └── Feedback.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── menuRoutes.js
    │   ├── orderRoutes.js
    │   ├── batchRoutes.js
    │   └── feedbackRoutes.js
    ├── middleware/
    │   └── auth.js                  # JWT middleware
    └── server.js                    # Entry point
```

---

## 🔮 Future Improvements

- Integrate Razorpay for real UPI/card payments
- Add Firebase push notifications for order updates
- Multi-canteen support with canteen-specific menus
- Image upload via Cloudinary instead of URL input
- Student loyalty points and reward system
- WhatsApp order notifications via Twilio
- Voice ordering using Web Speech API
- Weekly analytics reports via email

---

## 👨‍💻 Author

**Satwika Morampudi**  
GitHub: [@satwi](https://github.com/satwika-morampudi)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
