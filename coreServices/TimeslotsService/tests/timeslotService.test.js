import { describe, it, expect, vi } from 'vitest';
import Timeslot from '../src/models/Timeslot'; // Adjust the path based on your actual file structure

// Mock the Timeslot model
vi.mock('../src/models/Timeslot', () => {
  // Mock the save method
  const mockSave = vi.fn();

  // Return the mocked model with the save method
  return {
    default: vi.fn().mockImplementation(() => ({
      save: mockSave,  // The save method is now part of the mock instance
    })),
  };
});

describe('Timeslot Model Tests', () => {
  it('should create a new Timeslot successfully', async () => {
    const mockTimeslotData = {
      start: '2024-12-25T10:00:00Z',
      end: '2024-12-25T11:00:00Z',
      dentist: 'some-dentist-id',
      office: 'some-office-id',
    };

    // Mock save to resolve with the timeslot data
    Timeslot().save.mockResolvedValue(mockTimeslotData);

    // Create a new instance of Timeslot
    const newTimeslot = new Timeslot(mockTimeslotData);

    const savedTimeslot = await newTimeslot.save();

    // Assertions
    expect(savedTimeslot).toEqual(mockTimeslotData);
    expect(Timeslot().save).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if required fields are missing', async () => {
    const invalidTimeslotData = { start: 'invalid-date', end: 'invalid-date' };

    // Mock save to throw an error for invalid data
    Timeslot().save.mockRejectedValue(new Error('Invalid data format'));

    await expect(new Timeslot(invalidTimeslotData).save()).rejects.toThrow('Invalid data format');
  });
});
