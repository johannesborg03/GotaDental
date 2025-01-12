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

    try {
        const cacheKey = `office:${office_id}:timeslots`;

        // Step 1: Check if the timeslots are already cached
        const cachedTimeslots = await redisClient.get(cacheKey);

        if (cachedTimeslots) {
            console.log('Cache hit for office timeslots:', cacheKey);
            const successResponse = { success: true, timeslots: JSON.parse(cachedTimeslots) };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
            return;
        }

        console.log('Cache miss for office timeslots:', cacheKey);

        // Step 2: Fetch office details from database
        const office = await Office.findById(office_id, 'timeslots');
        if (!office) {
            const errorResponse = { success: false, error: 'Office not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslotIds = office.timeslots; // Array of ObjectIds for timeslots
        console.log('Fetched timeslot IDs from office:', timeslotIds);

        if (!timeslotIds || timeslotIds.length === 0) {
            const successResponse = { success: true, timeslots: [] };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
            return;
        }

        // Step 3: Fetch timeslot details from another service (e.g., via broker)
        const timeslotTopic = 'timeslot/retrieveByIds';
        const timeslotCorrelationId = uuidv4(); 
        const timeslotMessage = { timeslot_ids: timeslotIds };
        const timeslotResponse = await publishMessage(timeslotTopic, timeslotMessage, timeslotCorrelationId);

        if (!timeslotResponse || !timeslotResponse.success) {
            const errorResponse = { success: false, error: 'Failed to fetch timeslot details' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Step 4: Cache the timeslot details in Redis for 96 hours
        await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(timeslotResponse.timeslots));

        // Step 5: Cache the office details if needed (optional)
        const officeCacheKey = `office:${office_id}:details`;
        await redisClient.setEx(officeCacheKey, CACHE_EXPIRATION, JSON.stringify(office));

        // Respond with the fetched timeslot details
        const successResponse = { success: true, timeslots: timeslotResponse.timeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });

        console.log('Successfully fetched and cached timeslot details:', successResponse.timeslots);

    } catch (error) {
        console.error('Error fetching timeslots for office:', error);
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
