import { describe, it, expect, vi } from 'vitest';
import Office from '../src/models/Office'; // Adjust the path based on your actual file structure

// Mock the Office model
vi.mock('../src/models/Office', () => {
  const mockSave = vi.fn();
  const mockFindOne = vi.fn();
  const mockFindById = vi.fn(); // Mock findById for retrieving an office by ID
  const mockUpdateOne = vi.fn(); // Mock update for updating office details

  return {
    default: vi.fn().mockImplementation(() => ({
      save: mockSave,
      findOne: mockFindOne, // Mock findOne for querying offices
      findById: mockFindById, // Mock findById method for querying office by ID
      updateOne: mockUpdateOne, // Mock update for updating office details
    })),
  };
});

describe('Office Service Tests', () => {
  it('should create a new office successfully', async () => {
    const mockOfficeData = {
      name: 'Bright Smiles Dental Clinic',
      address: '123 Dental St.',
      contact: '123-456-7890',
    };

    // Mock save to resolve with the office data
    Office().save.mockResolvedValue(mockOfficeData);

    // Create a new instance of Office
    const newOffice = new Office(mockOfficeData);

    const savedOffice = await newOffice.save();

    // Assertions
    expect(savedOffice).toEqual(mockOfficeData);
    expect(Office().save).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if required fields are missing', async () => {
    const invalidOfficeData = { name: 'Bright Smiles Dental Clinic' }; // Missing other required fields

    // Mock save to throw an error for invalid data
    Office().save.mockRejectedValue(new Error('Invalid data format'));

    await expect(new Office(invalidOfficeData).save()).rejects.toThrow('Invalid data format');
  });

  it('should throw an error if office is not found when querying by ID', async () => {
    // Mock findById to return null when an invalid ID is queried
    Office().findById.mockResolvedValue(null);

    // Handling the case where `findById` returns `null` and should throw an error
    await expect(async () => {
      const office = await Office().findById('invalid-office-id');
      if (!office) throw new Error('Office not found');
    }).rejects.toThrow('Office not found');
  });

  it('should return an office when queried by a valid office ID', async () => {
    const mockOfficeData = {
      _id: 'valid-office-id',
      name: 'Bright Smiles Dental Clinic',
      address: '123 Dental St.',
      contact: '123-456-7890',
    };

    // Mock findById to return a valid office based on ID
    Office().findById.mockResolvedValue(mockOfficeData);

    const office = await Office().findById('valid-office-id');

    // Assertions
    expect(office).toEqual(mockOfficeData);
    expect(Office().findById).toHaveBeenCalledWith('valid-office-id');
  });

  it('should update an existing office successfully when provided with valid data', async () => {
    const updatedOfficeData = {
      name: 'Updated Bright Smiles Dental Clinic',
      address: '456 Updated St.',
      contact: '987-654-3210',
    };

    // Mock findById to return a valid office
    const mockOffice = { _id: 'valid-office-id', ...updatedOfficeData };

    // Mock updateOne to resolve with the updated office data
    Office().updateOne.mockResolvedValue({ nModified: 1 });

    const updatedOffice = await Office().updateOne({ _id: 'valid-office-id' }, updatedOfficeData);

    // Assertions
    expect(updatedOffice.nModified).toBe(1);
    expect(Office().updateOne).toHaveBeenCalledWith({ _id: 'valid-office-id' }, updatedOfficeData);
  });
});
