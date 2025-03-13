<template>
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card p-4 shadow-sm" style="width: 450px;">
            <h3 class="text-center mb-3">Registrati</h3>

            <form @submit.prevent="register">
                <div class="row mb-3">
                    <div class="col">
                        <label class="form-label">Nome: </label>
                        <input type="text" class="form-control" v-model="hr.name" placeholder="Inserisci il tuo nome"
                            required>
                    </div>
                    <div class="col">
                        <label class="form-label">Cognome:</label>
                        <input type="text" class="form-control" v-model="hr.surname" placeholder="Inserisci il tuo cognome"
                            required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col">
                        <label class="form-label">Email:</label>
                        <input type="email" class="form-control" v-model="hr.email" placeholder="Inserisci la tua email"
                            required>
                    </div>
                    <div class="col">
                        <label class="form-label">Password:</label>
                        <input type="password" class="form-control" v-model="hr.password"
                            placeholder="Inserisci la tua password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-success w-100">Registrati</button>
            </form>

            <div class="text-center mt-3">
                <router-link to="/login" class="text-decoration-none">⬅ Torna al Login</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import HRService from '@/service/HRService'; // Importa il servizio
export default {
    data() {
        return {
            hr: {
                name: '',
                surname: '',
                email: '',
                password: '',
            }
        };
    },
    methods: {
        

        async register() {
            if (!this.hr.email || !this.hr.password || !this.hr.name || !this.hr.surname) {
                alert("Tutti i campi sono obbligatori!");
                return;
            }

            try {
                const emailExists = await HRService.getHrByEmail(this.hr.email);
                if (emailExists.data) {
                    alert("L'email è già registrata!");
                    return;
                }
            } catch (error) {
                if (error.response && error.response.status !== 404) {
                    alert("Errore nel controllo email!");
                    return;
                }
            }

            try {
                await HRService.addHr(this.hr);
                alert("Registrazione completata!");
                this.$router.push('/login');
            } catch (error) {
                alert("Errore durante la registrazione!");
            }
        }

    }
};
</script>
