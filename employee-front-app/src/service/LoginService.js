import axios from 'axios';

const API_URL = 'http://localhost:8083/api/v1/authentication';

export default {
    async auth(user) {
        try {
            const response = await axios.post(API_URL, user);
            return response.data; // Restituisce { check, message, list }

        } catch (error) {
            alert("anyone found here")
            return { check: false, message: "anyone found here", employees: response.data.employees, id: id };
        }
    }
};