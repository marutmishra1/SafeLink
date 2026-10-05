# SafeLink 🚨

### Resilient Emergency Communication When Networks Fail

SafeLink is an emergency communication platform designed for disaster-affected areas where conventional internet or cellular networks may become unreliable or unavailable.

It combines emergency alerts, offline message queuing, network awareness, location sharing, AI-assisted priority detection, file attachments, and peer-to-peer communication capabilities into a single platform.

---

## 🚨 Problem

During floods, cyclones, earthquakes, fires, and other disasters, communication infrastructure can become unreliable.

People in affected areas may experience:

- Internet connectivity loss
- Cellular network outages or congestion
- Difficulty reporting emergencies
- Difficulty sharing their location
- Loss of messages during network outages
- Delays in identifying critical situations

In an emergency, losing connectivity should not automatically mean losing the ability to communicate.

---

## 💡 Solution

SafeLink provides a resilient communication workflow designed to remain useful during unstable network conditions.

Users can create emergency alerts and messages while the application monitors network availability.

When connectivity is temporarily unavailable, supported messages can be stored locally and synchronized with the backend when the connection is restored.

> **Create critical information when needed. Synchronize when connectivity returns.**

---

## ✨ Key Features

### 🚨 Emergency Alerts

Users can create emergency alerts using categories such as:

- Medical
- Trapped
- Fire
- Flood
- Accident
- Other

Alerts can contain emergency messages, priority information, location data, and attachments.

### 🧠 AI-Assisted Priority Detection

SafeLink uses AI-assisted analysis to determine the urgency of emergency messages.

Priority levels include:

- Low
- Important
- Critical

A fallback mechanism allows alert creation to continue even if the AI service becomes temporarily unavailable.

### 📡 Offline Message Queue

Messages created while offline can be stored locally using IndexedDB and synchronized when connectivity returns.

text
Create Message
      ↓
Network Unavailable
      ↓
Store Locally
      ↓
Network Restored
      ↓
Synchronize
      ↓
Backend
      ↓
Database

**Live Demo:**  
https://safe-link-psi.vercel.app

**Demo Video:**  
https://drive.google.com/file/d/1oCfXqpt0TIcgEhXYv5DTNQ9QxfYkdLBN/view

**GitHub Repository:**  
https://github.com/marutmishra1/SafeLink


## 👥 Team

| Name                   | Contribution                         |
| ---------------------- | ------------------------------------ |
| **Marut Mishra**       | Frontend, Backend, UI/UX, Deployment |
| **Anshika Srivastava** | Product/Research                     |
| **Yashwant Rao**       | AI / ML                              |
| **Priyanshu Singh**    | Presentation / Demo                  |
