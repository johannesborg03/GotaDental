<template>
    <div class="container-fluid p-0">
        <!-- Full-width Grid (Left side with image or text, right side with form) -->
        <div class="row m-0 align-items-start">
            <!-- Left Column for some Text or Image (Hidden on smaller screens) -->
            <div class="col-lg-6 d-flex flex-column justify-content-start align-items-start bg-muted text-white p-4 d-none d-lg-block">
                <h3 class="side-text mb-2">GötaDental</h3>
            </div>
            <!-- Right Column (Login Form) -->
            <div class="col-lg-6 d-flex justify-content-center align-items-center p-0">
                <div class="card shadow-lg w-100 h-100 border-0">
                    <div class="card-body p-5">
                        <h3 class="title mb-4 text-start">Login</h3>

                        <form @submit.prevent="onSubmit">
                            <!-- Username or SSN -->
                            <div class="mb-3">
                                <label for="username_ssn" class="form-label">Username or SSN</label>
                                <input type="text" id="username_ssn" v-model="username_ssn" placeholder="Enter username or SSN"
                                    class="form-control" required />
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" id="password" v-model="password" placeholder="Enter password"
                                    class="form-control" required />
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>

                        <!-- Register Links -->
                        <div class="mt-3 text-center">
                            <p>Don't have an account? <a href="/registerDentist">Register as Dentist</a> or <a
                                    href="/registerPatient">Register as Patient</a></p>
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
    data() {
        return {
            username_ssn: '',
            password: '',
        };
    },
    methods: {
        async onSubmit() {
            console.log("Submitting login form...");
            console.log("Data being sent:", {
                username_ssn: this.username_ssn,
                password: this.password,
            });
            try {
                const response = await axios.post('http://localhost:4000/api/login', {
                    username_ssn: this.username_ssn,
                    password: this.password,
                });

                console.log("Received response:", response.data);
                sessionStorage.setItem('userIdentifier', this.username_ssn);
                sessionStorage.setItem('Name', response.data.name);
                sessionStorage.setItem('Office', response.data.office);
                sessionStorage.setItem('OfficeId', response.data.officeId);
                sessionStorage.setItem('OfficeAddress', response.data.officeAddress);
        
                console.log('Office in response:', response.data.office);
                console.log('OfficeId in response:', response.data.officeId);
                
                if (/^\d{12}$/.test(this.username_ssn)) {
                    // Redirect to dentist homepage if user is a patient (has 12 digits)
                    this.$router.push('/patient');
                } else {
                    // Redirect to patient homepage if user is a dentist
                    this.$router.push('/dentist');
                }
            } catch (err) {
                console.error('Error during login:', err);
                if (err.response && err.response.data) {
                    alert(err.response.data.message || 'Login failed');
                } else {
                    alert('An error has occurred. Please try again.');
                }
            }
        },
    },
};
</script>

<style scoped>

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

.col-lg-6 {
    padding-left: 0;
    padding-right: 0;
    height: 100vh;
}

.card {
    height: 100%;
}
</style>
