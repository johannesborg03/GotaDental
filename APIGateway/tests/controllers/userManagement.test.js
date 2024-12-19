import { describe, test, expect, vi } from 'vitest';
import { publishMessage } from '../../src/mqttService'; // Simulated MQTT utility
import { registerDentist } from '../../src/controllers/dentistController';

vi.mock('../../utils/mqtt', () => ({
    publishMessage: vi.fn(),
}));

describe('registerDentist (MQTT Simulation)', () => {
    const mockRequest = (body) => ({ body });
    const mockResponse = () => {
        const res = {};
        res.status = vi.fn().mockReturnThis();
        res.json = vi.fn();
        return res;
    };

    test('should successfully publish a message and respond with 201', async () => {
        const req = mockRequest({
            name: 'Dr. Rav',
            username: 'Rav_001',
            email: 'dr.rav@example.com',
            date_of_birth: '1990-01-01',
            password: 'securepassword',
            officeId: '64b97f84e91a630d4f0f5abc',
        });

        const res = mockResponse();

        // Mock publishMessage to resolve successfully
        publishMessage.mockResolvedValue({ success: true, dentistId: '12345abcde' });

        await registerDentist(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Dentist registered successfully',
            data: { success: true, dentistId: '12345abcde' },
        });

        expect(publishMessage).toHaveBeenCalledWith(
            'dentists/register',
            {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                password: req.body.password,
                office: req.body.officeId,
            },
            expect.any(String), // Correlation ID
        );
    });

    test('should respond with 400 for missing required fields', async () => {
        const req = mockRequest({
            name: 'Dr. Rav',
            username: 'Rav_001',
            // Missing email, date_of_birth, password, and officeId
        });

        const res = mockResponse();

        await registerDentist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });

        // Ensure publishMessage is NOT called
        expect(publishMessage).not.toHaveBeenCalled();
    });

    test('should respond with 500 on server error', async () => {
        const req = mockRequest({
            name: 'Dr. Rav',
            username: 'Rav_001',
            email: 'dr.rav@example.com',
            date_of_birth: '1990-01-01',
            password: 'securepassword',
            officeId: '64b97f84e91a630d4f0f5abc',
        });

        const res = mockResponse();

        // Mock publishMessage to throw an error
        publishMessage.mockRejectedValue(new Error('MQTT broker failure'));

        await registerDentist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error while registering dentist' });

        expect(publishMessage).toHaveBeenCalled();
    });
});
