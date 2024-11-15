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
    </div>

</template>

<script>

</script>

<style>

</style>