const { subscribeToTopic } = require('./subscriber');
const Office = require('../models/Office');
const { publishMessage } = require('./publisher');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redisClient');

async function handleRetrieveAllOffices(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all offices message:', message);
    try {
        const offices = await Office.find();
        if(!offices){
            const errorResponse = { success: false, error: 'Invalid office' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, token: 'jwt-token-for-offices', offices};
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving offices:', error);
        const errorResponse = { success: false, error: 'Internal server error while fetching offices'};
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleRetrieveOfficesByID(message, replyTo, correlationId, channel) {
  
    console.log('Received request to retrieve office:', message);
    const { office_id } = message;

    try {
        if (!office_id) {
            const errorResponse = { success: false, error: 'Missing office_id in request.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Fetch the office details from the database
        const office = await Office.findById(office_id);
        if (!office) {
            const errorResponse = { success: false, error: 'Office not found.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        console.log(`Office details fetched: ${office.office_name}`);

        console.log(`Replying to: ${replyTo}, Correlation ID: ${correlationId}`);



        const successResponse = { success: true, office_name: office.office_name };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving office:', error);
        const errorResponse = { success: false, error: 'Internal server error while retrieving office.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}
async function handleCreateOffice(message, replyTo, correlationId, channel) {
    console.log('Received message from topic "offices/create":', message);

       // Destructure and validate the incoming message
       const { office_name, latitude, longitude, dentists, office_address } = message;

       if (!office_name || !latitude || !longitude || !office_address) {
           console.error('Invalid data for creating office:', message);
           const errorResponse = { success: false, error: 'Missing or invalid required fields' };
           channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
           return;
       }

    try {
        // Create the new office in the database
         //
         const newOffice = await Office.create({
            office_name,
            latitude,
            longitude,
            office_address,
         //   dentists: validatedDentists, // Use only validated dentist IDs
        });

        console.log('Office created successfully:', newOffice);

        const successResponse = { success: true, office: newOffice };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating office:', error);
        const errorResponse = { success: false, error: error.message };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


async function handleUpdateOffice(message, replyTo, correlationId, channel) {
    console.log('Processing office update:', message);

    const { officeId, dentistId } = message;

    try {
        // Validate the input data
        if (!officeId || !dentistId) {
            console.error('Invalid message data:', message);
            const response = { success: false, error: 'Invalid data. Both officeId and dentistId are required.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Find and update the office
        const office = await Office.findById(officeId);
        if (!office) {
            console.error('Office not found:', officeId);
            const response = { success: false, error: 'Office not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Add the dentist to the office's dentists array
        office.dentists.push(dentistId);
        await office.save();

        console.log(`Office ${officeId} updated successfully with dentist ${dentistId}.`);
        const response = { success: true, office };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    } catch (error) {
        console.error('Error updating office:', error);
        const response = { success: false, error: 'Internal server error while updating office.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}

async function handleUpdateOfficeTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received request to update Office timeslots:', message);

    const { officeId, timeslotId } = message;

    try {
        const office = await Office.findById(officeId);
        if (!office) {
            const errorResponse = { success: false, error: 'Office not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Add the timeslot ID to the office's timeslots array
        office.timeslots.push(timeslotId);
        await office.save();

        console.log('Updated Office timeslots successfully:', office);

        const successResponse = { success: true };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating Office timeslots:', error);
        const errorResponse = { success: false, error: 'Internal server error while updating Office timeslots.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
};

async function handleGetOfficeTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received request to fetch timeslots for office:', message);

    const { office_id } = message;
    const CACHE_EXPIRATION = 96 * 60 * 60; // 96 hours
    const cacheKey = `office:${office_id}:timeslots`;

    try {
        let timeslotIds = [];

        // Step 1: Attempt to fetch timeslots from the database
        try {
            const office = await Office.findById(office_id, 'timeslots');
            if (office && Array.isArray(office.timeslots)) {
                timeslotIds = office.timeslots;
                console.log(`Fetched timeslot IDs from database:`, timeslotIds);

                // Cache empty timeslot results and return early
                if (timeslotIds.length === 0) {
                    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify([]));
                    const successResponse = { success: true, timeslots: [] };
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
                    return;
                }
            } else {
                console.warn(`Office ${office_id} not found or has no timeslots.`);
            }
        } catch (dbError) {
            console.warn(`Database fetch error for office ${office_id}: ${dbError.message}`);
            console.warn('Falling back to cache.');
        }

        // Step 2: Fallback to Cache if database fetch failed
        if (timeslotIds.length === 0) {
            console.log(`Attempting to fetch from cache with key: ${cacheKey}`);
            const cachedTimeslots = await redisClient.get(cacheKey);
            if (cachedTimeslots) {
                console.log('Cache hit for office timeslots:', cacheKey);
                const successResponse = { success: true, timeslots: JSON.parse(cachedTimeslots) };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
                return;
            }

            console.warn('No cached data found. Proceeding to next step.');
        }

        // Step 3: Fetch Timeslot Details from Service
        if (timeslotIds.length > 0) {
            const timeslotTopic = 'timeslot/retrieveByIds';
            const timeslotCorrelationId = uuidv4();
            const timeslotMessage = { timeslot_ids: timeslotIds };

            console.log('Publishing message to fetch timeslot details:', timeslotMessage);
            try {
                const timeslotResponse = await publishMessage(timeslotTopic, timeslotMessage, timeslotCorrelationId);

                if (timeslotResponse && timeslotResponse.success) {
                    console.log('Fetched timeslot details from service:', timeslotResponse.timeslots);

                    // Cache the fetched timeslot details
                    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(timeslotResponse.timeslots));
                    const successResponse = { success: true, timeslots: timeslotResponse.timeslots };
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
                    return;
                } else {
                    console.error('Failed to fetch timeslot details from service:', timeslotResponse);
                }
            } catch (serviceError) {
                console.error('Error fetching timeslot details from service:', serviceError.message);
            }
        }

        // Step 4: No Data Found in Database, Cache, or Service
        console.error('No data found in database, cache, or service for office:', office_id);
        const errorResponse = { success: false, error: 'Failed to fetch timeslot details' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    } catch (error) {
        console.error('Unexpected error in handleGetOfficeTimeslots:', error);
        const errorResponse = { success: false, error: 'Internal server error' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


async function initializeOfficeSubscriptions() {
    try {
        await subscribeToTopic('retrieveAll/offices', handleRetrieveAllOffices);
        console.log('Subscribed to retrieveAll/offices');

        await subscribeToTopic('offices/retrieve', handleRetrieveOfficesByID);
        console.log('Subscribed to offices/retrieve');

        await subscribeToTopic('offices/create', handleCreateOffice);
        console.log('Subscribed to offices/create');

        await subscribeToTopic('offices/update', handleUpdateOffice);
        console.log('Subscribed to offices/update');

        await subscribeToTopic('offices/updateTimeslot', handleUpdateOfficeTimeslot);
        console.log('Subscribed to offices/updateTimeslot');

        await subscribeToTopic('offices/timeslots/retrieve', handleGetOfficeTimeslots);
        console.log('Subscribed to offices/timeslots/retrieve');


        console.log('Office subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing office subscriptions:', error);
    }
}

module.exports = {
    initializeOfficeSubscriptions,
    handleRetrieveAllOffices,
    handleCreateOffice,
    handleUpdateOffice,
    handleUpdateOfficeTimeslot,
    handleGetOfficeTimeslots
};
