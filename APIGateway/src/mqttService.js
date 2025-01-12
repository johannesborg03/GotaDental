const amqp = require('amqplib');
const eventEmitter = require('./events/eventEmitter'); // Import the global event emitter


let channel;
let connection;
let io;

// WebSocket Event Mapping for Topics
const topicToEventMap = {
    'timeslot/create': 'timeslot/create',
    'timeslot/update': 'timeslot/update',
};

function initializeWebSocket(serverIO) {
    io = serverIO;
    console.log('WebSocket initialized in mqttService');

    /*
    // Listen for MQTT messages
    eventEmitter.on('mqttMessage', ({ topic, message }) => {
        console.log(`Broadcasting MQTT message to WebSocket for topic: ${topic}`, message);

        const officeId = message.officeId || message.officeId || undefined;
        if (!officeId) {
            console.error(`No officeId found in message: ${JSON.stringify(message)}`);
            return;
        }

        // Emit WebSocket event to the relevant office room
        if (io) {
            io.to(officeId).emit(topic, message);
            console.log(`WebSocket event emitted to room "${officeId}"`);
        }
    });
    */

    // Handle WebSocket client connections
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('joinOffice', ({ officeId }) => {
            if (officeId) {
                console.log(`Client ${socket.id} joined office room: ${officeId}`);
                socket.join(officeId);
            } else {
                console.error(`Client ${socket.id} did not provide an office ID.`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

function getIO() {
    if (!io) throw new Error('WebSocket not initialized');
    return io;
}


async function connectRabbitMQ() {
    connection = await amqp.connect('amqp://rabbitmq:5672');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
}

async function publishMessage(topic, message, correlationId) {
    if (!channel) {
        console.error('Channel is not initialized');
        throw new Error('MQTT channel is not initialized');
    }

    return new Promise(async (resolve, reject) => {
        console.log(`Publishing to topic: ${topic}`);
console.log(`Message:`, message);
console.log(`Correlation ID: ${correlationId}`);
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for response on correlationId: ${correlationId}`));
        }, 20000); // 10-second timeout for the response

        try {
            // Create a temporary reply queue
            const replyQueue = await channel.assertQueue('', { exclusive: true });

            // Listen to the reply queue for responses
            const consumerTag = await channel.consume(
                replyQueue.queue,
                (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        const response = JSON.parse(msg.content.toString());
                        clearTimeout(timeout); // Clear the timeout
                        channel.cancel(consumerTag.consumerTag); // Stop consuming
                        resolve(response); // Resolve the promise with the response

                        // Dynamically Emit WebSocket Event
                        const webSocketEvent = topicToEventMap[topic];
                        if (response.success && io && webSocketEvent) {
                            const { officeId } = message;
                            io.to(officeId).emit(webSocketEvent, response.timeslot);
                            console.log(`WebSocket event "${webSocketEvent}" emitted for office "${officeId}"`);
                        }
                    }
                },
                { noAck: true }
            );

            // Publish the message to the specified topic
            await channel.assertExchange(topic, 'fanout', { durable: false });
            channel.publish(topic, '', Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: replyQueue.queue,
            });

            console.log(`Message published to topic "${topic}" with correlationId "${correlationId}"`);
        } catch (error) {
            clearTimeout(timeout); // Clear the timeout on error
            console.error('Error publishing message:', error);
            reject(new Error(`Failed to publish message: ${error.message}`));
        }
    });
}


async function subscribeToTopic(topic, callback) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(topic, 'fanout', { durable: false });
    const queue = await channel.assertQueue('', { exclusive: true });
    console.log(`Subscribed to topic "${topic}"`);

    channel.bindQueue(queue.queue, topic, '');
    channel.consume(queue.queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        console.log(`Received message from topic "${topic}":`, message);

        console.log('Office Id:', message.officeId);
        
        // Emit an event for WebSocket handling
        eventEmitter.emit('mqttMessage', { topic, message });

       // Call the callback if provided
       if (callback) {
           callback(message);
       }
   });
}

// Handle timeslot creation and emit WebSocket events
function handleTimeslotCreate(message) {
    console.log('Handling timeslot creation:', message);
    // Extract fields from the message
    const { _id: timeslotId, start, end, isBooked, officeId, patient} = message;

    if (!timeslotId || !officeId) {
        console.error('Missing timeslotId or officeId in WebSocket message:', message);
        return;
    }

    console.log(`Timeslot created with ID: ${timeslotId}`);

    // Emit the event to the WebSocket clients
    if (io) {
        io.to(officeId).emit('timeslot/create', {
            _id: timeslotId,
            start,
            end,
            isBooked,
            officeId,
            patient
        });
        console.log(`WebSocket timeslot/create event emitted with ID: ${timeslotId}`);
    }
}

// Handle timeslot updates and emit WebSocket events
function handleTimeslotUpdate(message) {
    console.log('Handling timeslot update:', message);

    const { officeId, timeslot_id, isBooked, patient } = message;

    if (!officeId) {
        console.error('No officeId provided in update message:', message);
        return;
    }

    // Broadcast the updated timeslot to the relevant office room
    if (io) {
        io.to(officeId).emit('timeslot/update', {
            timeslot_id,
            isBooked,
            patient,
        });
        console.log(`WebSocket timeslot update sent to office ${officeId}`);
    }
}

// Add topic subscriptions
async function initializeSubscriptions() {
  //  await subscribeToTopic('timeslot/create', handleTimeslotCreate);
  //  await subscribeToTopic('timeslot/update', handleTimeslotUpdate);
    console.log('Subscriptions initialized');
}

module.exports = { connectRabbitMQ, publishMessage, subscribeToTopic, initializeWebSocket, initializeSubscriptions, handleTimeslotUpdate, handleTimeslotCreate, getIO };