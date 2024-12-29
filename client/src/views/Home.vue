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
                        <h3 class="title mb-4 text-center">Login</h3>

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