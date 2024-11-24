<template>
    <div class=" container mt-5">
        <div class="card shadow-lg p-4">
            <h2 class="text-center mb-4">Register as a Dentist</h2>
            <form @submit.prevent="registerDentist">
                <div class="form-group mb-3">
                    <label for="name" class="form-label">Full Name:</label>
                    <input type="text" id="name" v-model="formData.name" class="form-control"
                        placeholder="Enter your full name" required />

                </div>
                <div class="form-group mb-3">
                    <label for="email" class="form-label">Email:</label>
                    <input type="email" id="email" v-model="formData.email" class="form-control"
                        placeholder="Enter your email" required />

                </div>
                <div class="form-group mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" id="password" v-model="formData.password" class="form-control"
                        placeholder="Enter a password" required />
                </div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Register</button>
                </div>

                <div v-if="errorMessage" class="alert alert-danger mt-3">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="alert alert-success mt-3">
                    {{ successMessage }}
                </div>
            </form>

        </div>
    </div>
</template>

<script>

</script>

<style></style>