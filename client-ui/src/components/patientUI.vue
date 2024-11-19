<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Available Slots</h1>
        </div>

        <!-- Available Slots Section -->
        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-secondary">Book a Slot</h2>
                <ul class="list-group">
                    <li v-for="(slot, index) in availableSlots" :key="index"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <i class="bi bi-calendar-event text-primary"></i>
                            {{ slot.date }} at {{ slot.time }}
                        </span>
                    </li>
                </ul>
                <div v-if="availableSlots.length === 0" class="text-center mt-3 text-muted">
                    <i>No slots available</i>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { connectClient, subscribeToTopic } from '../mqttClient';

export default {
    data() {
        return {
            availableSlots: [],
        };
    },
    mounted() {
        const brokerUrl = 'ws://localhost:15675/ws';
        const client = connectClient(brokerUrl);

        subscribeToTopic('slots/update', (message) => {
            const slot = JSON.parse(message);
            this.availableSlots.push(slot);
        });
    },
};
</script>
