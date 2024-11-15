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

            <div class="notifications">
                <h2>Notification</h2>
                <ul>
                    <li v-for="(notification, index) in notifications" :key="index">
                        {{ notification.message }} - {{ notification.date }}
                    </li>
                </ul>
            </div>
        </div>
    </template>
</template>