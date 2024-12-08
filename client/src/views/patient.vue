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
                            {{ formatSlot(slot.date_and_time) }}
                        </span>
                        <button class="btn btn-success btn-sm" @click="bookSlot(slot, index)">
                            Book
                        </button>
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
import axios from 'axios';

export default {
    data() {
        return {
            availableSlots: [],
        };
    },
    methods: {
        async fetchAvailableSlots() {
            try {
                const response = await axios.get('http://localhost:4000/api/timeslots/available');
                this.availableSlots = response.data.timeslots;
            } catch (error) {
                console.error('Error fetching slots:', error);
                alert('Failed to fetch slots. Please try again later.');
            }
        },
        formatSlot(dateTime) {
            const date = new Date(dateTime);
            return date.toLocaleString();
        },
        async bookSlot(slot, index) {
            try {
                const response = await axios.post('http://localhost:4000/api/appointments/book', {
                    timeslot_id: slot._id,
                });
                if (response.status === 201) {
                    alert('Time slot booked successfully!');
                    this.availableSlots.splice(index, 1);
                }
            } catch (error) {
                console.error('Error booking slot:', error);
                if (error.response && error.response.status === 409) {
                    alert('Time slot no longer available!');
                } else {
                    alert('Failed to book time slot. Please try again later.');
                }
            }
        },
    },
    async mounted() {
        await this.fetchAvailableSlots();
    },
};
</script>
