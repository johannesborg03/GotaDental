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
export default {
    data() {
        return {
            availableSlots: [],
        };
    },
    async mounted() {
        try {
            const response = await fetch('/api/slots');
            const slots = await response.json();
            this.availableSlots = slots;
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    },
};
</script>
