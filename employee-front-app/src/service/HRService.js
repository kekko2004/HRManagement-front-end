import axios from "axios";
const URL = "http://localhost:8082/api/v1/hr"

export default {

    getHrs() {
        return axios.get(URL);
    },
    getHrByID(id) {
        return axios.get(`${URL}/${id}`);
    },
    getHrByEmail(email) {
        return axios.get(`${URL}/e:${email}`);
    },

    //so many 

    //add-update-delete

    addHr(hr) {
        return axios.post(`${URL}/create`, hr);
    },
    updateHr(hr, id) {
        return axios.put(`${URL}/update/${id}`, hr);
    },
    deleteHr(id) {
        return axios.delete(`${URL}/delete/${id}`);
    }

}