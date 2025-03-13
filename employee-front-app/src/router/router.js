import { createRouter, createWebHistory } from 'vue-router';
import LoginComponent from '@/components/LoginComponent.vue';
import EmployeeComponent from '@/components/EmployeeComponent.vue';
import RegisterComponent from '@/components/RegisterComponent.vue';

const routes = [
    { path: '', name: 'login', component: LoginComponent },
    { path: '/login', name: 'login', component: LoginComponent },
    {
        path: '/employees',
        name: 'employees',
        component: EmployeeComponent,
        props: route => ({ employees: (route.state && route.state.employees) ? route.state.employees : [] })
    },
    { path: '/register', component: RegisterComponent }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
