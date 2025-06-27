// services/api.js
const DHIS2_BASE_URL = 'https://your-dhis2-server.org/api'; // replace with actual URL
const DHIS2_USERNAME = 'admin'; // replace with actual credentials
const DHIS2_PASSWORD = 'district';

// Helper to encode credentials
const getAuthHeader = () => {
  const token = btoa(`${DHIS2_USERNAME}:${DHIS2_PASSWORD}`);
  return `Basic ${token}`;
};

// Example: sync a data value set
export const syncToDHIS2 = async (dataSetPayload) => {
  try {
    const response = await fetch(`${DHIS2_BASE_URL}/dataValueSets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(dataSetPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DHIS2 Sync failed: ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error syncing to DHIS2:', error);
    throw error;
  }
};