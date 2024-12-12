<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Available Appointments</h1>
        </div>
        
        <!-- Available Timeslots -->
        <div v-if="timeslots.length > 0">
            <h2 class="mt-4">Available Timeslots</h2>
            <div v-for="slot in timeslots" :key="slot.id" class="card my-2 p-2">
                <p>
                    <strong>Date:</strong> {{ new Date(slot.date_and_time).toLocaleDateString() }} <br>
                    <strong>Time:</strong> {{ new Date(slot.date_and_time).toLocaleTimeString() }} <br>
                    <strong>Dentist:</strong> {{ slot.dentist_username }}
                </p>
                <button class="btn btn-primary" @click="bookTimeslot(slot.id)" :disabled="slot.is_booked">
                    {{ slot.is_booked ? "Booked" : "Book Slot" }}
                </button>
            </div>
        </div>
        <p v-else class="text-danger mt-4">No available timeslots for the selected office.</p>
    </div>
</template>

<script>
</script>