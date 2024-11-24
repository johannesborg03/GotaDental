<template>
    <div class=" container mt-5">
        <div class="card shadow-lg p-4">
            <h2 class="text-center mb-4">Register as a Dentist</h2>
            <form @submit.prevent="registerDentist">
              <div class="form-group mb-3">
                <label for="name" class="form-label">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  class="form-control"
                  placeholder="Enter your full name"
                  required
                />

        </div>

    </div>
</div>
</template>

<script>

</script>

<style>

</style>