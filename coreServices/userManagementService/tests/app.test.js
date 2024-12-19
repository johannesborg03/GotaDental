import request from 'supertest';
import app from '../app';
import { describe, test, expect, afterAll } from 'vitest';

describe('POST dentist', () => {
    const officeId = '64b97f84e91a630d4f0f5abc'; // Mocked ObjectId for the office
    const testDentistUsername = 'Rav_001';

    test('should create a new dentist and return 201 status', async () => {
        const newDentist = {
            dentist_username: testDentistUsername,
            password: 'securepassword',
            name: 'Dr.Rav',
            email: 'dr.Rav@example.com',
            appointments: [],
            timeslots: [],
            office: officeId
        };

        const response = await request(app)
            .post('/api/dentists')
            .send(newDentist)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Dentist Created Successfully');
        expect(response.body).toHaveProperty('dentist');
        expect(response.body.dentist).toMatchObject({
            dentist_username: newDentist.dentist_username,
            name: newDentist.name,
            email: newDentist.email,
            office: officeId,
        });
    });

    test('should return 400 if dentist with same username already exists', async () => {
        const duplicateDentist = {
            dentist_username: testDentistUsername,
            password: 'anotherMichael',
            name: 'Michael Scott',
            email: 'Dr.Scott@example',
            appointments: [],
            timeslots: [],
            office: officeId
        };

        // Attempt to create another patient with the same snn
        const response = await request(app)
            .post('/api/dentists')
            .send(duplicateDentist)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.field).toBe('dentist_username');
        expect(response.body.message).toBe('A dentist with the same dentist_username already exist');
    });

    test('should return 500 if there is a server error (Dentist)', async () => {
        const invalidDentist = {
            invalidField: 'invalidData',
        };

        const response = await request(app)
            .post('/api/dentists')
            .send(invalidDentist)
            .set('Accept', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error while creating dentist');
        expect(response.body.error).toBeDefined();
    });


    afterAll(async () => {
        await request(app)
            .delete(`/api/dentists/${testDentistUsername}/delete`)
            .set('Accept', 'application/json')
    });

});
describe('POST patient', () => {

    const testPatientssn = '134456719109';

    test('should create a new patient and return 201 status', async () => {
        const newPatient = {
            patient_ssn: testPatientssn,
            password: 'yoda',
            name: 'jabo',
            email: 'jabo@example.com',
            notified: false,
            appointments: []
        };

        const response = await request(app)
            .post('/api/patients')
            .send(newPatient)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Patient Created Successfully');
        expect(response.body.patient).toMatchObject({
            patient_ssn: newPatient.patient_ssn,
            name: newPatient.name,
            email: newPatient.email
        });

    });

    afterAll(async () => {
        await request(app)
            .delete(`/api/patients/${testPatientssn}/delete`)
            .set('Accept', 'application/json')
    });

    test('should return 400 if patient with same patient_ssn already exists', async () => {
        const duplicatePatient = {
            patient_ssn:  testPatientssn,
            password: 'yoda',
            name: 'jabo',
            email: 'jabo@example.com',
            notified: false,
            appointments: []
        };

        // Attempt to create another patient with the same snn
        const response = await request(app)
            .post('/api/patients')
            .send(duplicatePatient)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.field).toBe('patient_ssn');
    });

    test('should return 500 if there is a server error (Patient)', async () => {
        const invalidPatient = {
            invalidField: 'invalidData',
        };

        const response = await request(app)
            .post('/api/patients')
            .send(invalidPatient)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error while creating patient');
        expect(response.body.error).toBeDefined();
    });
});
