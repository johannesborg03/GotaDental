<template>
    <div class="container-fluid p-0">
        <!-- Full-width Grid (Left side with image and right side with form) -->
        <div class="row m-0 align-items-start">
            <!-- Left Column for GötaDental Text and Description (Hidden on smaller screens) -->
            <div class="col-lg-6 d-flex flex-column justify-content-start align-items-start bg-muted text-white p-4 d-none d-lg-block">
                <h3 class="side-text mb-2">GötaDental</h3>
            </div>

            <!-- Right Column (Registration Form) -->
            <div class="col-lg-6 d-flex justify-content-center align-items-center p-0">
                <div class="card shadow-lg w-100 h-100 border-0">
                    <div class="card-body p-5">
                        <h3 class="title mb-4">Register as a Dentist</h3>

                        <form @submit.prevent="registerDentist">
                            <!-- Name -->
                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name</label>
                                <input type="text" id="name" v-model="input.name" class="form-control"
                                    placeholder="Enter your full name" required />
                            </div>

                            <!-- Username -->
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" id="username" v-model="input.username" class="form-control"
                                    placeholder="Enter a username" required />
                            </div>

                            <!-- Email -->
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" v-model="input.email" class="form-control"
                                    placeholder="Enter your email" required />
                            </div>

                            <!-- Date of Birth -->
                            <div class="mb-3">
                                <label for="date_of_birth" class="form-label">Date of Birth</label>
                                <input type="text" id="date_of_birth" v-model="input.date_of_birth" class="form-control"
                                    placeholder="Enter your date of birth (YYYY-MM-DD)" required />
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" id="password" v-model="input.password" class="form-control"
                                    placeholder="Enter a password" required />
                            </div>

                            <!-- Confirm Password -->
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirm Password</label>
                                <input type="password" id="confirmPassword" v-model="input.confirmPassword"
                                    class="form-control" placeholder="Confirm password" required />
                            </div>

                            <!-- Office Selection -->
                            <div class="mb-3">
                                <label for="office" class="form-label">Select Office</label>
                                <select id="office" v-model="input.officeId" class="form-select" required>
                                    <option value="" disabled>Select your office</option>
                                    <option v-for="office in offices" :key="office._id" :value="office._id">
                                        {{ office.office_name }}
                                    </option>
                                </select>
                            </div>

                            <!-- Submit Button -->
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">Register</button>
                            </div>

                            <!-- Error and Success Messages -->
                            <div v-if="errorMessage" class="alert alert-danger mt-3">
                                {{ errorMessage }}
                            </div>
                            <div v-if="successMessage" class="alert alert-success mt-3">
                                {{ successMessage }}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "registrationDentist",
    data() {
        return {
            input: {
                name: '',
                username: '',
                email: '',
                date_of_birth: '',
                password: '',
                confirmPassword: '',
                officeId: '',
            },
            offices: [],
            errorMessage: "",
            successMessage: "",
        };
    },
    methods: {
        async fetchOffices() {
            try {
                const response = await axios.get("http://localhost:4000/api/offices");
                if (response.data && response.data.offices) {
                    this.offices = response.data.offices;
                } else {
                    console.error("No offices found in the response");
                    this.errorMessage = "No offices available. Please try again later.";
                }
            } catch (error) {
                console.error("Error fetching offices:", error);
            }
        },
        async registerDentist() {
            const dateOfBirthRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
            if (!dateOfBirthRegex.test(this.input.date_of_birth)) {
                this.errorMessage = 'Date of Birth must be in the format YYYY-MM-DD.';
                return;
            }

            const date = new Date(this.input.date_of_birth);
            if (isNaN(date.getTime())) {
                this.errorMessage = 'Invalid Date of Birth. Please enter a valid date.';
                return;
            }

            if (this.input.password !== this.input.confirmPassword) {
                this.errorMessage = 'Passwords do not match.';
                return;
            }

            this.errorMessage = '';

            try {
                const response = await axios.post('http://localhost:4000/api/dentists', {
                    name: this.input.name,
                    username: this.input.username,
                    email: this.input.email,
                    date_of_birth: this.input.date_of_birth,
                    password: this.input.password,
                    officeId: this.input.officeId,
                });
                this.successMessage = response.data.message || 'Registration successful!';
                this.$router.push('/login');  // Redirect to login after successful registration
            } catch (err) {
                if (err.response && err.response.data) {
                    this.errorMessage = err.response.data.message || 'Failed to register';
                } else {
                    this.errorMessage = 'An error occurred. Please try again later.';
                }
            }
        },
    },
    mounted() {
        this.fetchOffices();
    },
};
</script>

<style scoped>
/* Remove any padding/margin on the right side */
.card-body {
    padding: 1.5rem;
    /* Customize padding if needed */
}

.card {
    border-radius: 0;
    /* Optional: Remove card border-radius */
}

.side-text {
    color: #356BBB;
    font-family: 'Filson Pro';
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.title {
color: #356BBB;
font-family: 'Filson Pro';
margin-bottom: 50px;
}

.container {
    position: relative;
    padding: 20px;
}

.text-left {
    position: absolute;
    top: 0;
    left: 0;
}

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
</style>