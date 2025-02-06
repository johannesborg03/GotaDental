# GötaDental
A system developed to enable a smooth, efficient, robust and reliable experience for the dentists and patients of Gothenburg.

## Description

Götadental is a robust, event-driven dentist appointment booking system designed to streamline the process for both patients and dentists. The system leverages microservices architecture, utilizing technologies such as Vue.js, Bootstrap, Express.js, Node.js, MongoDB, and RabbitMQ to deliver an efficient and user-friendly experience. 

This project aims to improve the efficiency of the appointment booking process, making it more convenient for both patients and dentists while ensuring smooth communication between all involved parties.

This was a project developed through our Distributed Systems Development Mini Project course in University.

### Key Features:

#### User Management: 
Separate services for dentist and patient profiles, with secure login functionality and a seamless user experience.

#### Appointment Booking: 
Patients can easily book and manage appointments via an intuitive web interface, with real-time availability updates from dentists.
Its using RabbitMQ and websocket to update any changes simultaneously without need of a refresh from the user.
#### Timeslot Management: 
Dentists can efficiently manage available time slots, ensuring that appointments are scheduled based on their availability.
#### Notifications: 
A dedicated functionality for sending real-time notifications about appointment status, reminders, and cancellations via email.
#### Event-Driven Communication: 
Using RabbitMQ as the messaging middleware, the system supports efficient and reliable communication between the various microservices.

## Architecture

The system is utilizing the microservices architecture combined with event-driven architecture. This is to create a scalable, robust and modular system. Each service is independent and is deployed separately so if one service would fail the others would still be up and running. Caching is also an important feature that allows users to still see their timeslots and bookings for the next 96 hours incase a database would fail. 


### Overview diagram of the architecture for our system

<img width="733" alt="Skärmavbild 2025-02-06 kl  16 05 51" src="https://github.com/user-attachments/assets/fc38e8a2-577a-49b7-9454-f43025647e2b" />



## Installation
This project uses Docker and Docker Compose to set up the application in containers. Follow the steps below to get started:

### Prerequisites

Before starting, ensure that you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started) (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29 or later)

### Steps to Set Up

1. **Clone the repository**  
   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/gotadental.git
   cd gotadental

   Build and start the containers
The project uses Docker Compose to manage all the services. To build the Docker images and start the containers, run the following command:
docker-compose up --build

**Access the application**
After the containers are up and running, you can access the application in your browser at:
http://localhost:3000

**Stop the containers**
When you're done, you can stop the containers by running the following command:
docker-compose down

### Configuration
There are a few environment variables that can be configured for your local environment. These variables are typically placed in a .env file in the project root directory. The following environment variables are available:

MONGO_URI: The URI for connecting to the MongoDB database (e.g., mongodb://localhost:27017).
RABBITMQ_URI: The URI for connecting to the RabbitMQ message broker (e.g., amqp://localhost).
These values are already set in the docker-compose.yml file for local development.

## Usage
### Login Screen
<img width="1470" alt="Skärmavbild 2025-02-06 kl  16 58 44" src="https://github.com/user-attachments/assets/de880e80-e48c-4d0f-aeef-980c04c87301" />

### Patient Dashboard
<img width="1470" alt="Skärmavbild 2025-02-06 kl  16 56 20" src="https://github.com/user-attachments/assets/267d1028-cbe1-4a5e-875b-bb1e50675df1" />

### Patient Booking Page
<img width="1470" alt="Skärmavbild 2025-02-06 kl  16 59 46" src="https://github.com/user-attachments/assets/6ef2c6d7-287d-44f8-9694-67c8fd707966" />

### Dynamic and interactive map of Gothenburg with offices
<img width="1470" alt="Skärmavbild 2025-02-06 kl  16 55 54" src="https://github.com/user-attachments/assets/82b63dcb-6a49-4fe7-80ef-b10dd9361561" />

### Dynamic updates of a patients Appointments
<img width="1470" alt="Skärmavbild 2025-02-06 kl  16 58 32" src="https://github.com/user-attachments/assets/2a8f0d9b-79f8-4800-a0c8-29b7d17c1642" />

### ------------------------------

## Support
For contact, feel free to email me, Johannes Borg at:
johannes.borg03@gmail.com
or use my university email at:
johabo@chalmers.se

## Authors
We was in total 3 people that worked on this project.
#### Johannes Borg
#### Ravi Sharma
#### Hassan Alhilo

