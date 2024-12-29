<template>
    <div class="container-fluid p-0">
        <!-- Full-width Grid (Left side with image or text, right side with form) -->
        <div class="row m-0 align-items-start">
            <!-- Left Column for some Text or Image (Hidden on smaller screens) -->
            <div class="col-lg-6 d-flex flex-column justify-content-start align-items-start bg-muted text-white p-4 d-none d-lg-block">
                <h3 class="side-text mb-2">GötaDental</h3>
            </div>

            <!-- Right Column (Registration Form) -->
            <div class="col-lg-6 d-flex justify-content-center align-items-center p-0">
                <div class="card shadow-lg w-100 h-100 border-0">
                    <div class="card-body p-5">
                        <h3 class="title mb-4">Register as a Patient</h3>

                        <form @submit.prevent="register">
                            <!-- SSN -->
                            <div class="mb-3">
                                <label for="ssn" class="form-label">SSN</label>
                                <input type="text" id="ssn" v-model="ssn" placeholder="Enter your SSN" class="form-control"
                                    required />
                                <small v-if="errorMessage" class="text-danger">{{ errorMessage }}</small>
                            </div>

                            <!-- Name -->
                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name</label>
                                <input type="text" id="name" v-model="name" placeholder="Enter your full name"
                                    class="form-control" required />
                            </div>

                            <!-- Email -->
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" v-model="email" placeholder="Enter your email"
                                    class="form-control" required />
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" id="password" v-model="password" placeholder="Enter a password"
                                    class="form-control" required />
                            </div>

                            <!-- Confirm Password -->
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirm Password</label>
                                <input type="password" id="confirmPassword" v-model="confirmPassword"
                                    placeholder="Confirm password" class="form-control" required />
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" class="btn btn-primary w-100">Create Account</button>
                        </form>

                        <!-- Success or Error Message -->
                        <div v-if="toastMessage" class="toast align-items-center text-bg-success mt-3" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="d-flex">
                                <div class="toast-body">
                                    {{ toastMessage }}
                                </div>
                                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'CreatePatientAccount',
    data() {
        return {
            ssn: '',
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
            toastMessage: '',
        };
    },
    methods: {
        async register() {
            // Validate SSN
            if (!/^\d{12}$/.test(this.ssn)) {
                this.errorMessage = 'SSN needs to be exactly 12 digits!';
                return;
            }

            // Validate password match
            if (this.password !== this.confirmPassword) {
                this.errorMessage = 'Passwords do not match!';
                this.password = '';
                this.confirmPassword = '';
                return;
            }

            this.errorMessage = ''; // Clear error message if validation passes

            try {
                const response = await axios.post('http://localhost:4000/api/patients', {
                    ssn: this.ssn,
                    email: this.email,
                    name: this.name,
                    password: this.password,
                });

                this.toastMessage = response.data.message || 'Registration successful!';
                this.$router.push('/login');
            } catch (err) {
                if (err.response && err.response.data) {
                    this.errorMessage = err.response.data.message || 'Failed to register';
                } else {
                    this.errorMessage = 'An error occurred. Please try again.';
                }
            }
        },
    },
};
</script>

<style scoped>
/* Custom Styling */
.card {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.side-text {
    color: #356bbb;
    font-family: 'Filson Pro', sans-serif;
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.title {
    color: #356bbb;
    font-family: 'Filson Pro', sans-serif;
    margin-bottom: 50px;
}

.toast {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
}

.btn-primary {
    background-color: #356bbb;
    border: none;
}

/* Custom Grid and Flexbox Layout for Columns */
.container-fluid {
    padding-left: 0;
    padding-right: 0;
}

.row {
    height: 100vh;
}

.col-lg-6 {
    height: 100vh;
}

.d-flex {
    height: 100%;
    justify-content: center;
    align-items: center;
}

.card-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

/* Ensure the right column fills its parent container */
.col-lg-6 {
    padding-left: 0;
    padding-right: 0;
    height: 100vh;
}

.card {
    height: 100%;
}
</style>