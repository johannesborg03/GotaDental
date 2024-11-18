<template>
  <div class="dentist-interface">
    <h1>Dentist Interface</h1>


    <div class="slot-registration">
      <h2>Slot Registration</h2>
      <label for="slot-date">Date:</label>
      <input type="date" v-model="slotDate" />

      <label for="slot-time">Time:</label>
      <input type="time" v-model="slotTime" />

      <button @click="registerSlot">Register Slot</button>

      <p v-if="slotMessage" class="message">{{ slotMessage }}</p>
    </div>

    <div class="booking-notification">
      <h2>Booking Notifications</h2>
      <ul>
        <li v-for="(notification, index) in notifications" :key="index">
          {{ notification.message }} - {{ notification.time }}
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
import { publishMessage } from '../mqttClient';

export default {
  data() {
    return {
      slotDate: "",
      slotTime: "",
      slotMessage: "",
      //notifications: [{ message: this.slotMessage, time: this.slotTime },],
    };
  },
  methods: {
    async registerSlot() {
      if (!this.slotDate || !this.slotTime) {
        this.slotMessage = 'Please select both date and time.';
        return;
      }

      const slotDetails = {
        date: this.slotDate,
        time: this.slotTime,
        dentistId: 'dentist_456', // Replace with dynamic ID 
      };

      // Help publish slot to the RabbitMQ Broker
      await publishMessage('appointment_exchange', slotDetails, `slots.update`);

      this.slotMessage = `Slot registered for ${this.slotDate} at ${this.slotTime}`;
      this.slotDate = '';
      this.slotTime = '';
    },
  },
  mounted() {
    // Subscribe to the appointment requests for this specific dentist
    subscribeToTopic('appointment_exchange', 'appointments.patient_123', (msg) => {
      const message = JSON.parse(msg);
      this.notifications.push({ message: `Booking: ${message.date} at ${message.time}`, time: message.time });
    });
  },
};
</script>

<style></style>