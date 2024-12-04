# Microlearn App

A simple app with educational purpose to help students to utilize microlearning and track study time.

## Table of Contents
1. [Introduction] (#introduction)
2. [Installation] (#installation)
3. [Usage] (#usage)
4. [Features] (#features)
5. [Technologies Used] (#technologies-used)
6. [Future Development] (#future-development)
7. [IndexedDB](#indexeddb)
8. [FirebaseDB](#firebasedb)

## 1. Introduction

**Microlearn App** is designed to help student learn more efficiently by utilzing microlearning method. The method suggest the student to study in short periods with breaks between to improve learning efficiency.

## 2. Installation

1. Clone this repository:
   git clone https://github.com/hdamianwin/win_INF654/

2. Navigate to the project folder:
   cd Microlearning (PWA)

3. Open `index.html` in your web browser to run the app.

Alternatively, you can use a local server such as **Live Server** in VS Code for development.

## 3. Usage

1. Enter the **subject** and the **study time** (in minutes).
2. Click **Submit** for the app to calculate the study intervlals and breaks.
3. Follow the suggestions to improve studying by microlearning.
4. The study time is recorded in the history webpage.

## 4. Features

- User-friendly interface
- Personlized study time
- Simple and easy to use design

## 5. Technologies Used

- HTML
- CSS (Materialize CSS)
- JavaScript

## 6. Future Development

1. **Timer**: Add timers for the users to know when to study and when to take a break
2. **User Autentication**: Implement user login and registration system to have a personalized system.

## 7. IndexedDB

- The app uses **IndexedDB** to store study session data locally, allowing users to track their study sessions even when offline.
- When the app detects an internet connection, it synchronizes the data stored in IndexedDB with FirebaseDB.

## 8. FirebaseDB

- **FirebaseDB** is used to store study session data in the cloud, enabling users to sync their sessions across multiple devices and ensure their data is backed up online.
- It also allows for real-time updates of study session data.