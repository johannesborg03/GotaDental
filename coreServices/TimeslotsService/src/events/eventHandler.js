const { subscribeToTopic } = require('./subscriber');
const Timeslot = require('../models/Timeslot');


async function handleCreateTimeslot(message, replyTo, correlationId, channel) {


    // Extract data from the received message
    const { title, start, end, dentist, office } = message;

    try {
        // Validate the input data
        if (!title || !start || !end || !dentist || !office) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }
        // Create the timeslot
        const newTimeslot = new Timeslot({ title, start, end, dentist, office });
        await newTimeslot.save();


        // Update the office's timeslot array
        const officeDoc = await Office.findById(office);
        if (!officeDoc) {
            const errorResponse = { success: false, error: 'Office not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        officeDoc.timeslots.push(newTimeslot._id);
        await officeDoc.save();

        // Publish a message to update the dentist's timeslot array
        const updateDentistTopic = 'dentists/updateTimeslot';
        const updateDentistMessage = {
            dentistId: dentist,
            timeslotId: newTimeslot._id,
        };

        await publishMessage(updateDentistTopic, updateDentistMessage, correlationId);
        console.log(`Published message to update dentist timeslot array:`, updateDentistMessage);



        console.log('Timeslot created successfully:', newTimeslot);
        const successResponse = { success: true, timeslot: newTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating timeslot:', error);
        const response = { success: false, error: 'Internal server error while creating timeslot.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}


// Handle retrieving all timeslots for an office
async function handleGetAllTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all timeslots message:', message);

    const { office_id } = message;

    try {
        if (!office_id) {
            const errorResponse = { success: false, error: 'Missing office_id' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslots = await Timeslot.find({ office_id });
        console.log('Retrieved timeslots:', timeslots);

        const successResponse = { success: true, timeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving timeslots:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve timeslots' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


// Handle retrieving a specific timeslot
async function handleGetTimeslotById(message, replyTo, correlationId, channel) {
    console.log('Received retrieve timeslot message:', message);

    const { office_id, dentist_username, timeslot_id } = message;

    try {
        if (!office_id || !dentist_username || !timeslot_id) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslot = await Timeslot.findOne({ _id: timeslot_id, dentist_username, office_id });
        if (!timeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle updating a timeslot
async function handleUpdateTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received update timeslot message:', message);

    const { office_id, dentist_username, timeslot_id, date_and_time } = message;

    try {
        if (!office_id || !dentist_username || !timeslot_id || !date_and_time) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const updatedTimeslot = await Timeslot.findByIdAndUpdate(
            timeslot_id,
            { dentist_username, office_id, date_and_time },
            { new: true }
        );

        if (!updatedTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot: updatedTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to update timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle updating a timeslot
async function handleUpdateTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received update timeslot message:', message);

    const { office_id, dentist_username, timeslot_id, date_and_time } = message;

    try {
        if (!office_id || !dentist_username || !timeslot_id || !date_and_time) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const updatedTimeslot = await Timeslot.findByIdAndUpdate(
            timeslot_id,
            { dentist_username, office_id, date_and_time },
            { new: true }
        );

        if (!updatedTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot: updatedTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to update timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle deleting a timeslot
async function handleDeleteTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received delete timeslot message:', message);

    const { dentist_username, timeslot_id, office_id } = message;

    try {
        if (!dentist_username || !timeslot_id || !office_id) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const deletedTimeslot = await Timeslot.findByIdAndDelete(timeslot_id);

        if (!deletedTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot: deletedTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error deleting timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to delete timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Initialize subscriptions
async function initializeSubscriptions() {
    try {
        await subscribeToTopic('timeslot/create', handleCreateTimeslot);
        await subscribeToTopic('timeslot/office/retrieveAll', handleGetAllTimeslots);
        await subscribeToTopic('timeslot/retrieve', handleGetTimeslotById);
        await subscribeToTopic('timeslot/update', handleUpdateTimeslot);
        await subscribeToTopic('timeslot/delete', handleDeleteTimeslot);

        console.log('Timeslot subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing timeslot subscriptions:', error);
    }
}

module.exports = {
    initializeSubscriptions,
    handleCreateTimeslot,
    handleGetAllTimeslots,
    handleGetTimeslotById,
    handleUpdateTimeslot,
    handleDeleteTimeslot,
};