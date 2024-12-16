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

    test('should fail patient login with invalid credentials', async () => {
        Patient.findOne = vi.fn().mockResolvedValue(null);

        const message = { identifier: 'invalidSSN', password: 'wrongPassword' };
        const replyTo = 'responseQueue';
        const correlationId = 'testCorrelationId';

        await handlePatientLogin(message, replyTo, correlationId, channel);

        expect(Patient.findOne).toHaveBeenCalledWith({ patient_ssn: 'invalidSSN' });
        expect(channel.sendToQueue).toHaveBeenCalledWith(
            replyTo,
            Buffer.from(JSON.stringify({ success: false, error: 'Invalid SSN or password' })),
            { correlationId }
        );
    });

    test('should handle dentist login successfully', async () => {
        const mockDentist = { dentist_username: 'dentist1', password:"password123" };
        Dentist.findOne = vi.fn().mockResolvedValue(mockDentist);
    
        const message = { identifier: 'dentist1', password: 'securepass' };
        const replyTo = 'responseQueue';
        const correlationId = 'testCorrelationId';
    
        await handleDentistLogin(message, replyTo, correlationId, channel);
        expect(Dentist.findOne).toHaveBeenCalledWith({ dentist_username: 'dentist1' });
        expect(channel.sendToQueue).toHaveBeenCalledWith(
            replyTo,
            Buffer.from(JSON.stringify({success: false, error: 'Invalid username or password'})),
            { correlationId }
        );
    });

    test('should fail dentist login with incorrect password', async () => {
        const mockDentist = { dentist_username: 'dentist1', password: 'securepass' };
        Dentist.findOne = vi.fn().mockResolvedValue(mockDentist);

        const message = { identifier: 'dentist1', password: 'wrongpass' };
        const replyTo = 'responseQueue';
        const correlationId = 'testCorrelationId';

        await handleDentistLogin(message, replyTo, correlationId, channel);

        expect(Dentist.findOne).toHaveBeenCalledWith({ dentist_username: 'dentist1' });
        expect(channel.sendToQueue).toHaveBeenCalledWith(
            replyTo,
            Buffer.from(JSON.stringify({ success: false, error: 'Invalid username or password' })),
            { correlationId }
        );
    });
});