import {connect} from 'amqplib';

const connection = await connect('amqp://localhost');

const channel = await connection.createChannel();

const queue = 'messages';
const message = 'some info';

await channel.assertQueue(queue, {durable: false});
channel.sendToQueue(queue, Buffer.from(message));