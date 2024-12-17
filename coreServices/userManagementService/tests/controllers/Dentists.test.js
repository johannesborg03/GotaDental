import { describe, test, vi, expect } from 'vitest';
import Dentist from '../../src/models/Dentist';

// Mock the Dentist model
vi.mock('../../src/models/Dentist');

describe('Dentist Model Tests', () => {

    test('should create a new dentist successfully', async () => {
        // Mock the Dentist instance's save method
        const mockSave = vi.fn().mockResolvedValue({
            dentist_username: 'JohnDentist',
            password: 'tooth',
            name: 'John',
            email: 'JohnDentist@LinneDT.se',
            appointments: [],
            timeslots: []
        });

        // Mock the Dentist constructor 
        Dentist.mockImplementation(() => ({
            save: mockSave
        }))

        // Create a new Dentist 
        const newDentist = new Dentist({
            dentist_username: 'JohnDentist',
            password: 'tooth',
            name: 'John',
            email: 'JohnDentist@LinneDT.se',
            appointments: [],
            timeslots: []
        });

        // Call the save method 
        const savedDentist = await newDentist.save();

        // Assert the returned Dentist data 
        expect(savedDentist.dentist_username).toBe('JohnDentist');
        expect(savedDentist.password).toBe('tooth');
        expect(savedDentist.email).toBe('JohnDentist@LinneDT.se');
        expect(mockSave).toHaveBeenCalled();
    });

    test('should return error if dentist_username already exists', async () => {
        // Mock the dentist instance's save method to simulate a duplicate error
        const mockSave = vi.fn().mockRejectedValue({
            code: 11000, // Simulating a MongoDB duplicate key error
            keyValue: { dentist_username: 'JohnDentist' } // Simulated duplicate field
        });

        // Mock the Dentist constructor 
        Dentist.mockImplementation(() => ({
            save: mockSave
        }));

        // Create a new Dentist with a duplicate SSN
        const newDentist = new Dentist({
            Dentist: 'DR.bla',
            password: 'password123',
            name: 'John',
            email: 'john.doe@example.com',
            notified: false,
            appointments: []
        });

        // Simulate the controller's error handling for duplicate
        try {
            await newDentist.save();
        } catch (err) {
            // Assert that the error code is 11000 (duplicate error)
            expect(err.code).toBe(11000);

            // Assert the correct field is being checked for duplication
            expect(Object.keys(err.keyValue)[0]).toBe('dentist_username');
        }

        // Assert that the save method was called
        expect(mockSave).toHaveBeenCalled();
    });

});