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

    test('should handle patient login successfully', async () => {
        // Mock data
        const mockPatient = { patient_ssn: '12345', password: 'password123' };
        Patient.findOne = vi.fn().mockResolvedValue(mockPatient);

        // Input message
        const message = { identifier: '12345', password: 'password123' };
        const replyTo = 'responseQueue';
        const correlationId = 'testCorrelationId';

        await handlePatientLogin(message, replyTo, correlationId, channel);

        // Assertions
        expect(Patient.findOne).toHaveBeenCalledWith({ patient_ssn: '12345' });
        expect(channel.sendToQueue).toHaveBeenCalledWith(
            replyTo,
            Buffer.from(JSON.stringify({ success: true, token: 'jwt-token-for-patient', userType: 'patient' })),
            { correlationId }
        );
    });

    
});
