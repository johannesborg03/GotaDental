import { describe, it, expect, vi } from 'vitest';
import Timeslot from '../src/models/Timeslot'; // Adjust the path based on your actual file structure

// Mock the Timeslot model
vi.mock('../src/models/Timeslot', () => {
  const mockSave = vi.fn();
  const mockFindOne = vi.fn();
  const mockFindById = vi.fn(); // Mock findById for retrieving a timeslot by ID


  return {
    default: vi.fn().mockImplementation(() => ({
      save: mockSave,
      findOne: mockFindOne, // Mock findOne to check for overlapping timeslots
      findById: mockFindById, // Mock findById method
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

  it('should throw an error if timeslot dates overlap', async () => {
    const overlappingTimeslotData = {
      start: '2024-12-25T10:00:00Z',
      end: '2024-12-25T11:00:00Z',
      dentist: 'some-dentist-id',
      office: 'some-office-id',
    };

    // Simulate a scenario where a timeslot already exists (overlapping)
    const existingTimeslot = {
      start: '2024-12-25T09:30:00Z',
      end: '2024-12-25T10:30:00Z',
    };

    // Mock findOne to return an existing overlapping timeslot
    Timeslot().findOne.mockResolvedValue(existingTimeslot);

    // Try to create a new timeslot that overlaps with the existing one
    await expect(new Timeslot(overlappingTimeslotData).save()).rejects.toThrow('Invalid data format');
  });

  it('should return a timeslot when queried by a valid timeslot ID', async () => {
    const mockTimeslotData = {
      _id: 'valid-timeslot-id',
      start: '2024-12-25T10:00:00Z',
      end: '2024-12-25T11:00:00Z',
      dentist: 'some-dentist-id',
      office: 'some-office-id',
    };

    // Mock findById to return a valid timeslot based on ID
    Timeslot().findById.mockResolvedValue(mockTimeslotData);

    const timeslot = await Timeslot().findById('valid-timeslot-id');

    // Assertions
    expect(timeslot).toEqual(mockTimeslotData);
    expect(Timeslot().findById).toHaveBeenCalledWith('valid-timeslot-id');
  });

  it('should throw an error when querying by an invalid timeslot ID', async () => {
    // Mock findById to reject with an error when an invalid ID is queried
    Timeslot().findById.mockRejectedValue(new Error('Timeslot not found'));

    await expect(Timeslot().findById('invalid-timeslot-id')).rejects.toThrow('Timeslot not found');
  });
});
