# Microlearn App

A simple app with educational purpose to help students to utilize microlearning and track study time.

## Table of Contents
1. [Introduction] (#introduction)
2. [Installation] (#installation)
3. [Usage] (#usage)
4. [Features] (#features)
5. [Technologies Used] (#technologies-used)
6. [Service Worker] (#service-worker)
7. [Manifest File] (#manifest-file)
8. [Future Development] (#future-development)

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

## 6. Service Worker

The Microlearn App includes the service worker to let the application have offline capabilities and enhance performance by caching resources.

The caching ensures that the app can be accessed without the internet connection.

### Caching Strategy

- **Install Event**: The service worker caches specified assests during installation.
- **Activate Event**: The service worker detect the old caches and delete them upon activation of new service worker.
- **Fetch Event**: The service worker intercepts the network requests, check the  caches and return from the cache if found.

## 7. Maninfest File

The Microlearn App includes manifest file, which provides metadata for the PWA to be installed to the device.

- **Name**: Microlearn
- **Short Name**: ML
- **Description**: Manage your study time through microlearnning.
- **Icons**: Different sizes for responsiveness across devices.
- **Start URL**: Directs to the main page (index.html).
- **Display Mode**: Standalone for native app experience.
- **Background Color**: Matches the application's design.
- **Theme Color**: Matches the thems color for the app.

## 8. Future Development

1. **Timer**: Add timers for the users to know when to study and when to take a break
2. **User Autentication**: Implement user login and registration system to have a personalized system.
