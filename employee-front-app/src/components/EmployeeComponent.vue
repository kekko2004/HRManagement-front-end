<script>
import { Modal } from 'bootstrap';
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min"; // Assicurati di avere Bootstrap importato!
const backstick ="`";
import EmployeeService from '@/service/EmployeeService';
import HRService from '@/service/HRService';

import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

export default {
   setup() {

        const route = useRoute();
        const employees = ref([]); // Usato employees direttamente
        const employeeForm = ref({
            
            id: null,
            name: '',
            surname: '',
            birth: '',
            hiring: '',
            salary: '',
            cell: '',
            email: '',
            status: '', 
            id_hr: '', // Impostato inizialmente vuoto
        });

        // Carica i dati da sessionStorage e imposta id_hr automaticamente
        onMounted(() => {
            const storedEmployees = sessionStorage.getItem('employees');
            const storedIdHr = sessionStorage.getItem('id');
            console.log(storedIdHr, storedEmployees);

            if (storedIdHr) {
                
                    // Verifica che i dati siano un JSON valido
                    const parsedEmployees = JSON.parse(storedEmployees);
                    if (Array.isArray(parsedEmployees) && parsedEmployees.length >= 0) {
                        employees.value = parsedEmployees;
                        // Imposta id_hr dal sessionStorage
                        employeeForm.value.id_hr = storedIdHr; // Usa id_hr salvato
                        console.log("riga 31: ", storedIdHr, " ", employeeForm.value);
                    } else {
                        console.error("I dati 'employees' non sono validi o vuoti.");
                        employees.value = []; // Impostiamo un array vuoto se i dati non sono validi
                    }
            } else {
                console.warn("Dati 'employees' o 'id_hr' non trovati nel sessionStorage.");
                employees.value = []; // Inizializza come array vuoto se i dati non esistono
            }
        });

        return { employees, employeeForm };
    },



    data(){
        
        return {
            id_hr:'',
            statusQuery: '',
            minSalary: '', // Variabile per il salary minimo
            maxSalary: '', // Variabile per il salary massimo
            filteredEmployees: [],
            employees: [],
            storedIdHr: '',
             employeeFormDto:{
                id: null,
                name: '',
                surname:'', 
                birth: '',
                hiring:'',
                salary:'',
                cell:'',
                email:'',
                status:'',
                id_hr: ''
            },
            sortOrder: { // Stato per tenere traccia dell'ordine di ordinamento
                surname: 1, // 1 = ASC, -1 = DESC
                salary: 1,
                hiring: 1
            },
            acceptedStatus: ["MALATTIA", "AGGIORNAMENTO", "COLLABORAZIONE", "FERIE", "STAGE"],
            editing:false,
            modalinstance:null ,
            modalinstanceForHr: null,
            showToast: false,
            toastMessage: "",
            query: '',
            yearsQuery: '',
        }
    },
    computed:{
        modalTitle(){
            return this.editing ? 'edit Employee' : 'Add employee';
        },
        buttonLAbel(){
            
            return this.editing ? 'Update' : 'Save';
            
        }
        
    },
    methods:{
         showModal(employee = null) {
            if (employee) {
                this.employeeFormDto = { ...employee }
                this.editing = true;
            } else {
                this.editing = false;
                this.employeeFormDto = {
                    id: null,
                    name: '',
                    surname: '',
                    birth: '',
                    hiring: '',
                    salary: '',
                    cell: '',
                    email: '',
                    status: '',
                    id_hr: ''
                }
            }
            if (!this.modalinstance) {
                this.modalinstance = new Modal(document.getElementById('employeeModal'))
            }
            this.modalinstance.show();

        },
        showSuccessToast(message) {
            this.toastMessage = message;
            this.showToast = true;

            // Usa Bootstrap per mostrare il toast
            this.$nextTick(() => {
                const toastEl = document.getElementById("employeeToast");
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            });
        },
       
        // Esempio di salvataggio/aggiornamento di un impiegato
       async saveEmployee() {
            try {
                let response;
                // Usa storedIdHr nella funzione di salvataggio
                if (this.employeeFormDto.id > 0 ) {
                    response = await EmployeeService.updateEmployee(this.employeeFormDto, this.employeeFormDto.id);
                    this.showSuccessToast("Employee: " + this.employeeFormDto.name + " " + this.employeeFormDto.surname + " updated successfully!");
                    await this.loadEmployees(this.employeeFormDto.id_hr);
                } else {
                    // Aggiungi id_hr se non presente
                    this.employeeFormDto.id_hr = this.storedIdHr;
                    response = await EmployeeService.addEmployee(this.employeeFormDto);
                    this.showSuccessToast("Employee: " + this.employeeFormDto.name + " " + this.employeeFormDto.surname + " added successfully!");
                    await this.loadEmployees(this.employeeFormDto.id_hr);
                }
            } catch (error) {
                console.error("Error saving/updating employee:", error);
            }
        },
    
        // Esempio di eliminazione di un impiegato
        async deleteEmployee(id) {
            try {
                const response = await EmployeeService.getEmployeeByID(id);
                await EmployeeService.deleteEmployee(id); // Chiamata al servizio di eliminazione
                this.showSuccessToast("Employee: "+ id +" deleted successfully!");
                await this.loadEmployees(response.data.id_hr); 
                 // Ricarica la lista degli impiegati
            } catch (error) {
                console.error("Error deleting employee:", error);
                this.message = "An error occurred!";
            }
        },
          async loadEmployees(id) {
            try {
                
                const response = await EmployeeService.getEmployeesByHR(id);
                this.filteredEmployees = response.data.filter(employee => String(employee.id_hr) === String(id));

            } catch (error) {
                console.error("Errore nel caricamento:", error);
                return [];
            }
        }
        ,

        // Filtro degli employee in base alla query
        async filterEmployees() {
            let backupList = this.filteredEmployees;
            if(!this.query){
                this.filteredEmployees = backupList;
               console.log(backupList);
            }

            const words = this.query.toLowerCase().trim().split(/\s+/);
            console.log('Filtering with words:', words);  // Verifica cosa viene passato alla funzione

            this.filteredEmployees = this.employees.filter(employee =>
                words.every(word =>
                    employee.name.toLowerCase().includes(word) ||
                    employee.surname.toLowerCase().includes(word)
                )
            );
            console.log('Filtered employees:', this.filteredEmployees);  // Verifica il risultato del filtro
        },
          async filterEmployeesByYears() {
            // Filtro gli impiegati che lavorano da un numero di anni specificato
            if (!this.yearsQuery) {
                this.filteredEmployees = this.employees;
                 // Se non è stato selezionato un anno, mostriamo tutti gli impiegati
                return;
            }

            const yearsWorked = parseInt(this.yearsQuery); // Anni inseriti
            const currentDate = new Date();
            const targetDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - yearsWorked)); // Data target (data corrente - anni)

            this.filteredEmployees = this.employees.filter(employee => {
                const hiringDate = new Date(employee.hiring); // Data di assunzione
                return hiringDate <= targetDate; // Filtra gli impiegati assunti prima della data target
            });
            this.loadEmployees();
        },
        async filterEmployeesByStatus() {
            // Filtro gli impiegati in base allo status selezionato
            if (!this.statusQuery) {
                this.filteredEmployees = this.employees; 
                this.loadEmployees();// Se non è stato selezionato uno status, mostriamo tutti gli impiegati
                return;
            }

            this.filteredEmployees = this.employees.filter(employee =>
                employee.status === this.statusQuery
            );
        },
          async filterEmployeesBySalary() {
            if (this.minSalary !== '' && this.maxSalary !== '') {
                this.filteredEmployees = this.employees.filter(employee =>
                    employee.salary >= this.minSalary && employee.salary <= this.maxSalary
                );
            } else {
                this.filteredEmployees = this.employees;
            
            }this.loadEmployees();
        },
         sortBySurname() {
            this.filteredEmployees.sort((a, b) => {
                if (a.surname < b.surname) return -1;
                if (a.surname > b.surname) return 1;
                return 0;
            });this.loadEmployees();
        },
        // Funzione per ordinare per Salario (Più alto)
        sortBySalary() {
        },
        // Funzione per ordinare per Anno di Assunzione (Più lungo)
        sortByHiring() {
            this.filteredEmployees.sort((a, b) => new Date(a.hiring) - new Date(b.hiring)); // Ordinamento dalla data di assunzione più lontana
        },
         toggleSort(field) {
            // Inverti l'ordine (1 diventa -1 e viceversa)
            this.sortOrder[field] *= -1;

            // Applica l'ordinamento in base al campo selezionato
            this.filteredEmployees.sort((a, b) => {
                if (field === 'surname') {
                    return this.sortOrder.surname * a.surname.localeCompare(b.surname);
                }
                if (field === 'salary') {
                    return this.sortOrder.salary * (a.salary - b.salary);
                }
                if (field === 'hiring') {
                    return this.sortOrder.hiring * (new Date(a.hiring) - new Date(b.hiring));
                }
            });
        },
        resetSalaryFilters() {
            this.minSalary = 0;  // Ripristina il salario minimo a 20000
            this.maxSalary = 5000;  // Ripristina il salario massimo a 30000
            this.filterEmployees();   // Chiamata alla funzione di filtro (se necessario)
        },
        resetYearFilters(){
            this.yearsQuery = '';
            this.filterEmployees();
        },
        resetStatusFilters(){
            this.statusQuery = '';
            this.filterEmployees();
        },
        validateMinSalary() {
            // Se il salario minimo è negativo, impostalo a 0
            if (this.minSalary < 0) {
                this.minSalary = 0;
            }

            // Verifica se il salario massimo è inferiore al minimo + 5000
            if (this.maxSalary < this.minSalary + 5000) {
                this.maxSalary = this.minSalary + 5000; // Imposta il massimo in modo che sia sempre 5000 più del minimo
            }

            // Applica il filtro dei salari
            this.filterEmployeesBySalary();
        },
        validateMaxSalary() {
            // Se il salario massimo è inferiore al salario minimo + 5000, aggiorna automaticamente il massimo
            if (this.maxSalary < this.minSalary + 5000) {
                this.maxSalary = this.minSalary + 5000;
            }

            // Applica il filtro dei salari
            this.filterEmployeesBySalary();
        },
        logout() {
            localStorage.removeItem('userToken');
            this.$router.push('/login'); // Torna alla login page
        }
    },
    watch: {
            query(newQuery) {
                console.log('Query changed:', newQuery); // Verifica che la query venga aggiornata correttamente
                this.filterEmployees();
            }
    },
    props: {
        employees: Array
    },
    mounted(){
        const storedEmployees = sessionStorage.getItem('employees');
        const storedIdHr = sessionStorage.getItem('id');
        
        this.validateMaxSalary();
        this.validateMinSalary();
        
        console.log(storedIdHr, storedEmployees);
        console.log("id recuperato: " , storedIdHr);
        if (storedIdHr) {
            const parsedEmployees = JSON.parse(storedEmployees);
            this.filteredEmployees = parsedEmployees;
            this.storedIdHr = storedIdHr; // Assegna id_hr alla variabile
            this.employeeFormDto.id_hr = storedIdHr; 
            console.log(this.employeeFormDto);
        } else {
            console.warn("Dati 'employees' o 'id_hr' non trovati nel sessionStorage.");
            this.employees = [];
        }
        this.loadEmployees(this.storedIdHr);
        this.validateMaxSalary();
        this.validateMinSalary();
    }
}
</script>
<template>
    <nav class="navbar navbar-expand-lg" style="background-color: #edf9fc">
      <div class="container-fluid">
         <a class="navbar-brand" href="#">HR_Management</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarScroll" style="padding: 5px">
          <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">
            <button class="btn btn-outline-primary float-end" style="margin: 5px;" @click="showModal(null)">
            add Employee
        </button>
        <button @click="logout" class="btn btn-outline-danger float-end" style="margin: 5px;">Logout</button>
            </ul>
            <form class="d-flex" role="search" @submit.prevent="filterEmployees"> <!-- Aggiungi .prevent qui -->
              <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="query">
              <button class="btn btn-primary" type="submit">Search</button>
            </form>
        </div>
      </div>
    </nav>
    <div class="containeer mt-3 " >
    <nav class="navbar " style="justify-content: center; margin:  10px 30px">
      <div class="container-fluid">
        
        <form class="d-flex" role="search">
      <!-- Bottone per ordinare per Cognome (Alfabetico) -->
      <button class="btn  btn-outline-warning ms-2" type="button" @click="toggleSort('surname')">sort by ABC⥯</button>

      <!-- Bottone per ordinare per Salario (Più alto) -->
      <button class="btn  btn-outline-warning ms-2" type="button" @click="toggleSort('salary')">Sort by💲⥯</button>

      <!-- Bottone per ordinare per Anno di Assunzione (Più lungo) -->
      <button class="btn  btn-outline-warning ms-2" type="button"  @click="toggleSort('hiring')">Sort by 📅⥯</button>
    </form>
        <form class="d-flex" role="search">
            <select class="form-control me-2" v-model="yearsQuery" @change="filterEmployeesByYears">
              <option value="">Select years worked</option>
              <option value="1">1 year</option>
              <option value="5">5 years</option>
              <option value="10">10 years</option>
              <option value="15">15 years</option>
              <option value="20">20 years</option>
            </select>
            
           <button class="btn btn-danger ms-2" type="button" @click="resetYearFilters">x</button>
          </form>
           <!-- Terzo Form per filtro per status -->
          <form class="d-flex" role="search">
            <select class="form-control me-2" v-model="statusQuery" @change="filterEmployeesByStatus">
              <option value="">Select status</option>
              <option v-for="status in acceptedStatus" :key="status" :value="status">{{ status }}</option>
            </select>
            
           <button class="btn btn-danger ms-2" type="button" @click="resetStatusFilters">x</button>
          </form>
         <form class="d-flex" role="search">
      <!-- Salario Minimo -->
      <input 
        class="form-control me-2" 
        type="number" 
        placeholder="Min Salary" 
        v-model="minSalary" 
        @input="validateMinSalary" 
        step="5000" 
        min="0"  
      />

      <!-- Salario Massimo -->
      <input 
        class="form-control me-2" 
        type="number" 
        placeholder="Max Salary" 
        v-model="maxSalary" 
        @input="validateMaxSalary" 
        step="5000" 
        :min="minSalary + 5000" 
      />
       <button class="btn btn-danger ms-2" type="button" @click="resetSalaryFilters">x</button>
    </form>

      </div>
    </nav>
  <div class="container table-responsive" style="max-height: 400px; overflow-y: auto;">

<table class="table table-stripped mt-3 mytable " >
<thead>
    <tr>
        <th>id</th>
        <th>name</th>
        <th>surname</th>
        <th>email</th>
        <th>cell</th>
        <th>salary</th>
        <th>birth</th>
        <th>hiring</th>
        <th>status</th>
        <th>actions</th>
    </tr>
</thead>
<tbody>
    <tr v-for="employee in filteredEmployees" :key="employee.id">
        <td> {{ employee.id }}</td>
        <td> {{ employee.name }}</td>
        <td> {{ employee.surname }}</td>
        <td> {{ employee.email }}</td>
        <td> {{ employee.cell }}</td>
        <td> {{ employee.salary }}</td>
        <td> {{ employee.birth }}</td>
        <td> {{ employee.hiring }}</td>
        <td> {{ employee.status }}</td>
        <td>
            <button class="btn btn-warning"  @click="showModal(employee)">edit</button> <span></span>
    <button class="btn btn-danger" @click="deleteEmployee(employee.id)">Delete</button>        </td>
            
    </tr>
</tbody>
</table></div>

<div class="modal fadde" id="employeeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title">{{ modalTitle }}</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="close"></button>
            </div>
             
            <div class="modal-body">
      <form @submit.prevent="saveEmployee">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Name:</label>
            <input type="text" class="form-control" v-model="employeeFormDto.name" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Surname:</label>
            <input type="text" class="form-control" v-model="employeeFormDto.surname" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email:</label>
            <input type="email" class="form-control" v-model="employeeFormDto.email" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Cell:</label>
            <input type="text" class="form-control" v-model="employeeFormDto.cell" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Birth:</label>
            <input type="date" class="form-control" v-model="employeeFormDto.birth" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Hiring:</label>
            <input type="date" class="form-control" v-model="employeeFormDto.hiring" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Salary:</label>
            <input type="number" step="1000" class="form-control" v-model="employeeFormDto.salary" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Status:</label>
            <select v-model="employeeFormDto.status" class="form-select" required>
              <option disabled value="">Seleziona uno status</option>
              <option value="MALATTIA">MALATTIA</option>
              <option value="AGGIORNAMENTO">AGGIORNAMENTO</option>
              <option value="COLLABORAZIONE">COLLABORAZIONE</option>
              <option value="FERIE">FERIE</option>
              <option value="STAGE">STAGE</option>
            </select>
          </div>
          
        </div>
    <div class="col-md-6 mb-3">
                <input type="hidden" step="1000" class="form-control" v-model="employeeFormDto.id_hr" required>
              </div>
        <button class="btn btn-primary" type="submit" data-bs-dismiss="modal">{{ buttonLAbel }}</button>
      </form>
    </div>

        </div>
    </div>
</div>
    </div>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="employeeToast" class="toast align-items-center text-bg-dark border-0" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body">
        {{ toastMessage }}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>
</div>
</template>
<style>
.mytable{
justify-content: center;
}
.container{
    margin: 5%;
    margin-top: 40px;
    justify-content: center;align-items: center;width:90%;
}
</style>