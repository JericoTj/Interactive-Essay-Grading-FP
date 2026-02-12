# Final Project – Web Application Development and Security
Course Code: COMP6703001

Course Name: Web Application Development and Security

Institution: BINUS University International

---
## Project Information
Project Title: **EasyEssays**

Project Domain: **Interactive-Essay-Grading**

Class:  **[COMP6703001] B4AC**

Group Members:
    
    o Jerico, 2802521112, Team Lead, JericoTj
    o YiYang, 2802542924, Backend, TT1264
    o Sasha, 2802536442 , Support, mumeiphoric
---
## Instructor & Repository Access
This repository must be shared with:

• **Instructor: Ida Bagus Kerthyayana Manuaba**

    o Email: imanuaba@binus.edu
    o GitHub: bagzcode

• **Instructor Assistant: Juwono**

    o Email: juwono@binus.edu
    o GitHub: Juwono136

---
## Project Overview
### Problem Statement

    • What problem does this application solve?
        - This application is meant as an alternative and an easier way one can review, check or even check an essay or numerous essays in a single application

    • Who are the target users?
        - The target audiences for this applications are both students and lecturers/Teachers  

### Solution Overview

    • Main features
        - Main features that this app holds are the ability to check Essays from Grammar, Essay Format, AI checker , plagiarism checker and Grading such Essays

    • Why this solution is appropriate
        - This solution is appropriate as it allows all the thing students/teachers want to check in a single website

    • Where AI is used
        - AI is used to identify plagiarism, Grammar, Format, and Checking Originality from AI
---
## Technology Stack


| Layer  | Technology |
| ------------- |:-------------:|
| Frontend      | **Next.js**   |
| Backend       | **Node.js**     |
| API      | **REST API**     |
| Database      | **PostgreSQL / Firebase (for auth only)**     |
| Containerization      | **Docker**     |
| Deployment      | **Vercel**     |
| Version Control      | **GitHub**     |

---
## System Architecture
### Architecture Diagram

    **Insert architecture diagram image or ASCII diagram here.**
    - We are going for a Monolith Approach and here is a BETA version of our architecture diagram
[Draw.io To architecture Diagram Demo](https://drive.google.com/file/d/1vXJWzEUojUdsHUP0AKwCOP5IFZKlNHoX/view?usp=sharing)


### Architecture Explanation

    • Frontend ↔ API ↔ Database interaction
        - the frontend implementation we will be using is next.Js wiyth the backend using node,js 
        - The system will use a Modular Monolithic Architecture. As all the components will then be combined and deployed as a single applications, but in its internals it would be structured in multiples modules in a way to maintain the appliacation scalibility and maintainability from bugs and security flaws

    • Separation of concerns
        - 

    • Where security is enforced
        - Security is enforced in particularly login auth, and file storage to ensure user confidentiality

---
## API Design (MANDATORY)

### API Endpoints


| Method  | Endpoint | Description  | Auth Required | 
| ------------- |:-------------:|:-------------:|:-------------:|
| Get   |  |   | Yes/No | 
| Post   |  |   | Yes/No | 
| Put   |  |   | Yes/No | 
| Delete   |  |   | Yes/No | 


### API Documentation
    
    • Swagger / Postman link (if available)

    • Example request & response (JSON)

---
## Database Design

### Database Choice

Explain why you chose:

• PostgreSQL / MongoDB / Firebase

### Schema / Data Structure

Insert ERD or data structure diagram.

---

## AI Features

### AI Feature List

Describe at least TWO AI features.

AI Feature Purpose AI Type

NLP / OCR / Recommendation

NLP / OCR / Recommendation

### AI Integration Flow

Explain:

    • Input → AI processing → Output

    • How AI results are used in the system

---
## Security Implementation (MANDATORY)

### Describe how your project handles:

    • Authentication (JWT / session)
    • Authorization (roles)
    • Input validation
    • Protection against:
        o SQL / NoSQL Injection
        o XSS
        o CSRF
    • Secure API key handling
    
---

## Testing Documentation 

### Frontend Testing

### Backend & API Testing

### Security Testing 

### AI Functionality Testing 

---
11. Deployment & Production Setup

### Docker Setup

    • Dockerfile included

    • docker-compose.yml included

### Production Environment

    Explain:

    • Environment variables

    • Secrets handling

    • HTTPS configuration

### Live Application URL

    URL SOMETHING SOMETHING

---

### GitHub Contribution Summary (INDIVIDUAL)

Each student must list their own contribution.

Student Name: [Name]

    • Features implemented:

    • API endpoints handled:

    • Tests written:

    • Security work:

    • AI-related work:

__Contributions must match GitHub commit history.__

---

## AI Usage Disclosure (MANDATORY)

    List:

    • AI tools used (e.g., ChatGPT, OpenAI API)

    • Purpose of usage

    • Which parts were assisted

Example:
“ChatGPT was used to assist with API structure and AI testing scenario generation. All
code was reviewed and modified by the team.”

---

## Known Limitations & Future Improvements
    • Current limitations
    • Possible future enhancements
    • AI limitations and risks

---
## Final Declaration

We declare that:

    • This project is our own work
    • AI usage is disclosed honestly
    • All group members understand the system
Signed by Group Members:

---
# SETUP
## DEPLOYMENT INSTRUCTIONS
