# 🖥️ Mobile Tester Agent Frontend

This repository contains the **Frontend Dashboard** for the [Mobile Tester Agent](https://github.com/maikotrindade/mobile-tester-agent). The dashboard provides a user-friendly interface to configure, run, and monitor AI-powered test scenarios for Android applications.

---

## 🎯 Purpose

The frontend is the **visual interface** of the Mobile Tester Agent system. It allows users to:

* Define **test goals and steps**.
* Configure **AI agent parameters** (LLM choice, execution settings, etc.).
* Trigger tests via the backend API.
* View **reports and test results** in a structured way.

---

## 🏗️ Tech Stack

The frontend is built with modern web technologies:

* ⚛️ **ReactJS** → Core UI framework.
* 🎨 **TailwindCSS** → Styling with utility-first CSS.
* 📊 **Recharts** → Data visualization and charts.
* 🧩 **shadcn/ui** → Pre-styled UI components.
* 🌀 **Framer Motion** → Animations and transitions.
* 🌐 **REST API Integration** → Connects to the [Mobile Tester Agent backend](https://github.com/maikotrindade/mobile-tester-agent).

---

## 🔗 Relation to Main Project

This dashboard works in tandem with the **core agentic AI backend**:

* **Frontend (this repo):** Interface for creating test scenarios and viewing results.
* **Backend (Koog + Ktor API):** AI agent execution and communication with Android devices.
* **Sample Android App:** Provides a testing target for the agent.

For the full architecture, see the main project: [Mobile Tester Agent](https://github.com/maikotrindade/mobile-tester-agent).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/maikotrindade/mobile-tester-agent-frontend.git
cd mobile-tester-agent-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## 📎 References

* [Mobile Tester Agent (Backend)](https://github.com/maikotrindade/mobile-tester-agent)
* [Sample Android App](https://github.com/maikotrindade/mobile-tester-agent-sample-app)
* [Koog Documentation](https://docs.koog.ai)

---

✅ With this frontend, you can easily interact with the **AI-powered Mobile Tester Agent**, configure tests, and monitor execution results in real time.
