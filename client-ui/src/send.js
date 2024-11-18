import {connect} from 'amqplib';
//const amqp = require('amqplib');


const connection = await connect('amqp://localhost');

const channel = await connection.createChannel();

const queue = 'messages';
const message = 'some info';

await channel.assertQueue(queue, {durable: false});
//channel.sendToQueue(queue, Buffer.from(message));
await channel.assertExchange('logs', 'fanout', {durable: false});
await channel.bindQueue(queue, 'logs', '');
channel.publish('logs', '', Buffer.from('Hi Mom!'));
