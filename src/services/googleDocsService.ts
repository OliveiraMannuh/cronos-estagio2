/**
 * Service to handle Google Docs synchronization using the Google REST API.
 */

const DOCS_API_BASE = 'https://docs.googleapis.com/v1/documents';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';

const formatEntryDate = (dateValue: string): string => {
  // Preserve the exact calendar date stored in the record (YYYY-MM-DD).
  const [year, month, day] = dateValue.split('-');

  if (year && month && day) {
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Fallback for unexpected formats.
  return dateValue;
};

const buildGoogleApiError = async (response: Response, operation: string): Promise<Error> => {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const status = response.status;
  const apiMessage = payload?.error?.message || 'Google API request failed.';
  const apiStatus = payload?.error?.status || 'UNKNOWN';
  const apiReason = payload?.error?.errors?.[0]?.reason || 'unknown_reason';
  const message = `[GoogleAPI:${operation}] status=${status} apiStatus=${apiStatus} reason=${apiReason} message=${apiMessage}`;

  return new Error(message);
};

export interface GoogleDocInfo {
  id: string;
  title: string;
}

export const buildSyncHashMarker = (syncHash: string): string => `CRONOS_SYNC_HASH:${syncHash}`;

export const hasSyncHash = (docText: string, syncHash: string): boolean => {
  return docText.includes(buildSyncHashMarker(syncHash));
};

export const getDocText = async (accessToken: string, docId: string): Promise<string> => {
  const response = await fetch(`${DOCS_API_BASE}/${docId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw await buildGoogleApiError(response, 'getDocText');
  }

  const data = await response.json();
  const content = data?.body?.content || [];

  let fullText = '';
  for (const block of content) {
    const elements = block?.paragraph?.elements || [];
    for (const element of elements) {
      fullText += element?.textRun?.content || '';
    }
  }

  return fullText;
};

/**
 * Finds a document by title in the user's Google Drive.
 */
export const findDocByTitle = async (accessToken: string, title: string): Promise<string | null> => {
  const query = `name = '${title}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`;
  const response = await fetch(`${DRIVE_API_BASE}?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw await buildGoogleApiError(response, 'findDocByTitle');
  }

  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
};

/**
 * Creates a new Google Doc with the specified title.
 */
export const createDoc = async (accessToken: string, title: string): Promise<string | null> => {
  const response = await fetch(DOCS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw await buildGoogleApiError(response, 'createDoc');
  }

  const data = await response.json();
  return data.documentId;
};

/**
 * Appends a new entry to the Google Doc.
 */
export const appendToDoc = async (accessToken: string, docId: string, content: { date: string, startTime: string, endTime: string, report: string }) => {
  const textToAppend = `\n\n------------------------------------------------\nData: ${formatEntryDate(content.date)}\nHorário: ${content.startTime} - ${content.endTime}\n\n${content.report || 'Sem relatório escrito.'}\n`;

  const requestBody = {
    requests: [
      {
        insertText: {
          endOfSegmentLocation: { segmentId: '' },
          text: textToAppend,
        },
      },
    ],
  };

  const response = await fetch(`${DOCS_API_BASE}/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw await buildGoogleApiError(response, 'appendToDoc');
  }

  return await response.json();
};

/**
 * Completely replaces doc content with all entries (Syncing full state)
 */
export const syncAllEntriesToDoc = async (
  accessToken: string,
  docId: string,
  entries: any[],
  options?: { syncHash?: string }
) => {
  // Sort entries chronologically (oldest first)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  let fullText = 'Cronos Estágio - Relatório Consolidado\n\n';
  sortedEntries.forEach(entry => {
    fullText += `------------------------------------------------\n`;
    fullText += `Data: ${formatEntryDate(entry.date)}\n`;
    fullText += `Horário: ${entry.startTime} - ${entry.endTime}\n\n`;
    fullText += `${entry.reportText || 'Sem relatório escrito.'}\n\n`;
  });

  const updateHeader = `=== SINCRONIZAÇÃO COMPLETA EM ${new Date().toLocaleString('pt-BR')} ===\n\n`;
  const syncMarker = options?.syncHash ? `${buildSyncHashMarker(options.syncHash)}\n\n` : '';
  const nextContent = updateHeader + syncMarker + fullText;

  const docResponse = await fetch(`${DOCS_API_BASE}/${docId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!docResponse.ok) {
    throw await buildGoogleApiError(docResponse, 'syncAllEntriesToDoc.getDocument');
  }

  const docData = await docResponse.json();
  const bodyContent = docData?.body?.content || [];
  const endIndex = bodyContent.length > 0 ? bodyContent[bodyContent.length - 1].endIndex : 2;

  const requests: any[] = [];
  // Keep the final newline Google Docs requires, replacing the rest of the document.
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1,
        },
      },
    });
  }

  requests.push({
    insertText: {
      location: { index: 1 },
      text: nextContent,
    },
  });

  const requestBody = { requests };

  const response = await fetch(`${DOCS_API_BASE}/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw await buildGoogleApiError(response, 'syncAllEntriesToDoc');
  }

  return await response.json();
};
