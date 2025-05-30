// src/api/contactsApi.ts
import axios from 'axios';


import {Contact } from './../types/index';


const API_URL = 'https://your-backend-url.com/api/contacts'; // Your backend URL

// Function to fetch contacts from the backend
export const fetchContactsFromBackend = async (): Promise<Contact[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Assuming the backend returns the contacts in a 'data' field
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return []; // Return an empty array if there's an error
  }
};

// Function to add a new contact to the backend
export const addContactToBackend = async (contact: Contact): Promise<void> => {
  try {
    await axios.post(API_URL, contact);
    console.log('Contact added successfully!');
  } catch (error) {
    console.error('Error adding contact:', error);
  }
};
