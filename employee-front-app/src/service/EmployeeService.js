import axios from "axios";
const URL = "http://localhost:8081/api/v1/employee"

export default {

    getEmployees() {
        return axios.get(URL);
    },
    getEmployeeByID(id) {
        return axios.get(`${URL}/${id}`);
    },
    getEmployeesByName(name) {
        return axios.get(`${URL}/name=${name}`);
    },
    getEmployeesBySurname(surname) {
        return axios.get(`${URL}/surname=${surname}`);
    },
    getEmployeesByStatus(status) {
        return axios.get(`${URL}/Status/${status}`);
    },
    getEmployeesByHR(hr) {
        return axios.get(`${URL}/humanResource/${hr}`);
    },

    //so many 

    //add-update-delete

    addEmployee(employee) {
        return axios.post(`${URL}/create`, employee);
    },
    updateEmployee(employee, id) {
        return axios.put(`${URL}/update/${id}`, employee);
    },
    deleteEmployee(id) {
        return axios.delete(`${URL}/delete/${id}`);
    }
}