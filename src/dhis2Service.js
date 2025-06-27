// src/dhis2Service.js

const DHIS2_BASE_URL = 'https://play.dhis2.org/demo/api'; // Change to your DHIS2 URL
const DHIS2_AUTH = 'Basic ' + btoa('admin:district'); // Replace with your DHIS2 credentials or use OAuth tokens

// Prepare payload for dataValueSets API
export function createDataValueSetPayload(orgUnit, period, dataValues) {
  return {
    dataSet: 'YOUR_DATASET_ID',  // Replace with your DHIS2 DataSet ID
    orgUnit,
    period,
    dataValues,
  };
}

export async function pushStockExpiryToDHIS2(payload) {
  const url = `${DHIS2_BASE_URL}/dataValueSets`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: DHIS2_AUTH,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DHIS2 API Error: ${errorText}`);
  }

  return await response.json();
}

// (Optional) Fetch medicines from DHIS2 to sync locally
export async function fetchMedicinesFromDHIS2(orgUnit, period) {
  const url = `${DHIS2_BASE_URL}/analytics?dimension=dx:YOUR_DATAELEMENTS&dimension=ou:${orgUnit}&dimension=pe:${period}`;
  const response = await fetch(url, {
    headers: {
      Authorization: DHIS2_AUTH,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch medicines from DHIS2');
  }
  return await response.json();
}