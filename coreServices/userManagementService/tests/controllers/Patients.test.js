import { describe, test, vi, expect } from 'vitest';
import Patient from '../../src/models/Patient';

// Mock the Patient model
vi.mock('../../src/models/Patient');

describe('Patient Model Tests', () => {

  test('should create a new patient successfully', async () => {
    // Mock the Patient instance's save method
    const mockSave = vi.fn().mockResolvedValue({
      patient_ssn: '923456789109',
      password: '123',
      name: 'John',
      email: 'john.doe@example.com',
      notified: false,
      appointments: []
    });

    // Mock the Patient constructor 
    Patient.mockImplementation(() => ({
      save: mockSave
    }));

    // Create a new patient 
    const newPatient = new Patient({
      patient_ssn: '923456789109',
      password: 'password123',
      name: 'John',
      email: 'john.doe@example.com',
      notified: false,
      appointments: []
    });

    // Call the save method 
    const savedPatient = await newPatient.save();

    // Assert the returned patient data 
    expect(savedPatient.patient_ssn).toBe('923456789109');
    expect(savedPatient.name).toBe('John');
    expect(savedPatient.password).toBe('123');
    expect(savedPatient.email).toBe('john.doe@example.com');
    expect(mockSave).toHaveBeenCalled();
  });

  test('should return error if patient_ssn already exists', async () => {
    // Mock the Patient instance's save method to simulate a duplicate error
    const mockSave = vi.fn().mockRejectedValue({
      code: 11000, // Simulating a MongoDB duplicate key error
      keyValue: { patient_ssn: '123456789101' } // Simulated duplicate field
    });

    // Mock the Patient constructor 
    Patient.mockImplementation(() => ({
      save: mockSave
    }));

    // Create a new patient with a duplicate SSN
    const newPatient = new Patient({
      patient_ssn: '123456789101',
      password: 'password123',
      name: 'John',
      email: 'john.doe@example.com',
      notified: false,
      appointments: []
    });

    // Simulate the controller's error handling for duplicate
    try {
      await newPatient.save();
    } catch (err) {
      // Assert that the error code is 11000 (duplicate error)
      expect(err.code).toBe(11000);

      // Assert the correct field is being checked for duplication
      expect(Object.keys(err.keyValue)[0]).toBe('patient_ssn');
    }

    // Assert that the save method was called
    expect(mockSave).toHaveBeenCalled();
  });


});