import { describe, test, vi, expect } from 'vitest';
import Dentist from '../../src/models/Dentist';

// Mock the Patient model
vi.mock('../../src/models/Dentist');

describe('Patient Model Tests', () => {

    test('should create a new patient successfully', async () => {
        // Mock the Patient instance's save method
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
        expect(savedDentist.email).toBe('john.doe@example.com');
        expect(mockSave).toHaveBeenCalled();
    });

});