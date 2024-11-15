<template>
    <template>
        <div class="patient-interface">
            <h1>Your account</h1>

            <div class="booking-appointment">
                <h2>Book a appointment</h2>
                <label for="dateSlot">Select Date:</label>
                <input type="date" v-model="bookingDate" />

                <label for="timeSlot">Select Time:</label>
                <input type="time" v-model="bookingTime" />

                <button @click="bookSlot">Book Dentist Slot</button>

                <p v-if="bookingNotification" class="bookingNotification">{{ bookingNotification }}</p>
            </div>
        </div>
    </template>
</template>