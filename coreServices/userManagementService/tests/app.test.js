import request from 'supertest';
import app from '../app';  
import { describe, test, expect, beforeEach } from 'vitest';

describe('POST dentist', () => {
    const officeId = '64b97f84e91a630d4f0f5abc'; // Mocked ObjectId for the office

    // Clear dentists collection before each test
    beforeEach(async () => {
        await request(app)
            .delete('/api/dentists') 
            .set('Accept', 'application/json');
    });

    test('should create a new dentist and return 201 status', async () => {
        const newDentist = {
            dentist_username: 'Rav_001',
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
});
        describe('POST patient', () => {
        
            beforeEach(async () => {
                await request(app)
                    .delete('/api/patients') 
                    .set('Accept', 'application/json');
            });


        test ('should create a new patient and return 201 status',async () =>{
            const newPatient = {
                patient_ssn: '123456789101',
                password: 'yoda',
                name : 'jabo',
                email: 'jabo@example.com',
                notified : false, 
                appointments : []
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

        test('should return 400 if patient with same email already exists', async () => {
            const duplicatePatient = {
                patient_ssn: '123456789101',
                password: 'yoda',
                name: 'jabo',
                email: 'jabo@example.com',
                notified: false,
                appointments: []
            };
    
            // Create the first patient
            await request(app)
                .post('/api/patients')
                .send(duplicatePatient)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json');
    
            // Attempt to create another patient with the same snn
            const response = await request(app)
                .post('/api/patients')
                .send(duplicatePatient)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json');
    
            expect(response.status).toBe(400);
            expect(response.body.field).toBe('patient_ssn');
        });

        test('should return 500 if there is a server error', async () => {
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
