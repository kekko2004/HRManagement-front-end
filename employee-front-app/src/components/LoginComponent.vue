<template>
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card p-4 shadow-sm" style="width: 350px; background-color: white;">
            <h3 class="text-center mb-3">Login</h3>

            <form @submit.prevent="login">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" v-model="userForm.email" required
                        placeholder="Inserisci la tua email">
                </div>

                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div class="input-group">
                        <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="userForm.password"
                            required placeholder="Inserisci la password">
                        <button class="btn btn-outline-secondary" type="button" @click="togglePassword">
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100">Login</button>

                <div class="text-center mt-3">
                    <router-link to="/register" class="text-decoration-none">Registrati</router-link>
                </div>

                <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
                    {{ errorMessage }}
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import LoginService from '@/service/LoginService';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
 setup() {
        const router = useRouter();
        const userForm = ref({ email: '', password: '' });
        const errorMessage = ref('');
        const showPassword = ref(false);

        // Funzione per effettuare il login
      const login = async () => {
            const response = await LoginService.auth(userForm.value);

            // Aggiungi questo log per vedere la struttura esatta della risposta

            if (response.check) {
                // Controlliamo se response.list è effettivamente un array
                if (Array.isArray(response.employees)) {
                    console.log(response.employees);
                    sessionStorage.setItem('employees', JSON.stringify(response.employees));
                    sessionStorage.setItem('id', JSON.stringify(response.id));
                    console.log("Dati salvati correttamente:", response.employees, "id: ", response.id);
                    router.push({ name: 'employees' }, { name: 'id' });
                } else {
                    console.error("Errore: 'response.list' non è un array valido.");
                }
            } else {
                errorMessage.value = response.message;
            }
        };





        // Funzione per mostrare/nascondere la password
        const togglePassword = () => {
            showPassword.value = !showPassword.value;
        };

        return { userForm, errorMessage, showPassword, login, togglePassword };
    },
};

</script>

<style scoped>
.bg-light {
    background-color: #f8f9fa !important;
}

.bi {
    font-size: 1.2rem;
}
</style>
