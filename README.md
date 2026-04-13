# DoOr – Donor & Organ Resource Platform

---

## 📱 Live Application
• **Website**: https://arjunb2206.github.io/Door/login.html
• **Repository**: https://github.com/Arjunb2206/Door

---

## 🎯 What It Does
DoOr is an intelligent healthcare resource platform that:

- Connects patients with nearby blood banks and their real-time inventory
- Helps hospitals and patients coordinate organ availability and requests
- Provides a live map of blood banks, hospitals, and medical professionals
- Sends emergency notifications to registered blood donors in need
- Manages user profiles, donor status, and medical records securely

---

## 🛠️ Technologies Used

### 1. Firebase Authentication (Primary Tool)
- Firebase Auth Studio – Used to set up and manage user authentication
- Firebase Auth API – Integrated for secure sign-in and session handling

### 2. Firebase Firestore (Core Database)
- Cloud Firestore – Real-time NoSQL database for all app data

### 3. Other Technologies & Services
- GitHub Pages – Free static hosting

---

## 💻 Technical Stack

### Frontend
- HTML5 – Page structure
- CSS3 – Shared stylesheet with custom animations and theming
- JavaScript (ES6 Modules) – Logic, interactivity, and Firebase integration

### Backend & Database
- Firebase v10 – Authentication + Firestore (no custom backend needed)
- Firestore Real-time Listeners – Live data updates without page refresh

### Map Integration
- Leaflet.js – Blood bank and hospital map markers with geolocation

### State Management
- Firebase Auth State – Guards all pages, persists user sessions
- Firestore – All persistent data (profiles, requests, messages)

---

## 🏗️ Architecture

```
User → Frontend (HTML/CSS/JS) → Firebase Auth → Firestore → Real-time Updates → User
```

Flow:
1. User registers or logs in (Firebase Auth)
2. Auth state is checked on every page — unauthenticated users are redirected
3. Dashboard loads blood bank stats, hospital data, and user profile from Firestore
4. User submits blood/organ requests — written to Firestore, notifications triggered
5. Emergency donors receive real-time alerts based on blood type match

---

## 📁 Project Structure

```
door-final/
├── index.html              # Entry point (redirects to login)
├── login.html              # Sign In page
├── register.html           # Create Account page
├── dashboard.html          # Main dashboard (stats, map, quick actions)
├── blood.html              # 🩸 Blood Locator (bank inventory + request)
├── organ.html              # 🫀 Organ Request (hospital availability + form)
├── directory.html          # 🏥 Medical Directory
├── professional.html       # 👨‍⚕️ Doctors & Pharmacies
├── profile.html            # My Profile (Firestore read/write)
├── seed.html               # 🌱 Admin seed page (populate Firestore)
├── firebase-db.js          # 🔑 ALL Firebase operations (Auth + Firestore)
├── shell.js                # Shared navbar, sidebar, toast, chat, map helpers
├── styles.css              # Complete shared stylesheet
└── README.md               # This file
```

---

## 🔐 Features

### User System
- Email/Password authentication via Firebase Auth
- Persistent session across all pages
- Automatic redirect on sign-out
- Profile management (name, blood type, donor status, location)

### Blood Resource Management
- View blood bank inventory by blood type in real time
- Filter banks by city or distance on an interactive map
- Submit emergency blood requests (saved to Firestore)
- Receive in-app emergency alerts if you are a matching donor

### Organ Coordination
- Browse hospitals and their organ availability (Kidney, Liver, Heart, etc.)
- Submit organ requests directly through the platform
- Real-time availability status per hospital

### Medical Directory
- Browse medical facilities and professionals
- View doctors, pharmacies, and emergency contacts

### Real-Time Chat
- Built-in messaging via Firestore `onSnapshot` listeners
- Scoped chat rooms per resource type

---

## 🚀 Deployment

Hosted On: GitHub Pages

Steps to Deploy:
1. Push code to your GitHub repository
2. Go to Repository Settings → Pages
3. Select "main" branch and root folder
4. Save — your site is live!

---

## 🔗 Navigation Flow

```
login.html / register.html
         ↓ (Firebase Auth)
    dashboard.html  ←──────────────────────────────────┐
         ↓                                              │
   ┌─────┼──────────┬──────────────┬─────────────┐     │
blood.html  organ.html  directory.html  professional.html  profile.html
   │           │
   └── Firestore: blood_bank
           └── Firestore: hospitals (organs)
```

---

## 📊 Data Model

### Firestore Collections
| Collection | Description |
|---|---|
| `users` | User profiles, blood type, donor status, location |
| `blood_bank` | Blood bank details and per-type inventory |
| `hospitals` | Hospital info, organ availability |
| `blood_requests` | Emergency blood requests submitted by users |
| `organ_requests` | Organ requests submitted by users |
| `messages` | Real-time chat messages per room |

---


## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 🔮 Future Enhancements

### Planned Integrations
- Google Maps API – Enhanced routing and directions to blood banks/hospitals
- Firebase Cloud Messaging – Push notifications for emergency donor alerts
- Firebase Storage – Upload and store medical documents
- Google Calendar – Schedule donation appointments

### Feature Improvements
- Admin dashboard for hospital and blood bank data management
- Multi-language support (Kannada, Hindi, Tamil)
- Organ donor registration with government ID verification
- SMS alerts for critical blood shortages

---

## Credits

Primary Development:
- Firebase by Google (Auth + Firestore)
- Frontend Developer

Technologies:
- Firebase v10 by Google
- Leaflet.js for interactive maps
- GitHub Pages for hosting

---

### 🎨 Designed & 🤝 Collaborated by :
**-(Yashwanth Kumar N) https://github.com/Yashwanth-2006F**
**-(Bayineni Bhargav Naidu) https://github.com/bhargavnaidubayineni**
**-(Adithya K P) https://github.com/Adithya20-afk**
 
---

Maintained by :
Contact:
-https://github.com/Yashwanth-2006F
-https://github.com/bhargavnaidubayineni
-https://github.com/Adithya20-afk
-https://github.com/Arjunb2206

