import { describe, test, vi, expect, beforeEach } from 'vitest';

// Mock dependencies 
const { handlePatientLogin, handleDentistLogin } = require('../../src/events/eventHandler.js');
const Patient = require('../../src/models/Patient');
const Dentist = require('../../src/models/Dentist');

describe('Login Handlers', () => {
    let channel;

    beforeEach(() => {
        // Mock channel for RabbitMQ
        channel = {
            sendToQueue: vi.fn(),
        };
    });

   
});
