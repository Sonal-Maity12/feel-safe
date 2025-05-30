// In syncService.ts
import { getSyncPreference, setSyncPreference } from './syncSettings';



import { isOnline } from './networkUtils';
import { addContactToBackend } from '../api/contactsApi';
import { Contact } from '../types';

export const syncContact = async (contact: Contact) => {
  const syncWithCloud = await getSyncPreference();
  if (!syncWithCloud) {
    console.log("Sync is disabled.");
    return;
  }

  const online = await isOnline();
  if (!online) {
    console.log("Offline. Skipping sync.");
    return;
  }

  try {
    await addContactToBackend(contact);
    console.log("✅ Contact synced successfully!");
  } catch (err) {
    console.error("❌ Failed to sync contact:", err);
  }
};
