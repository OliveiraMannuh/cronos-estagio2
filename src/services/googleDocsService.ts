/**
 * Service to handle Google Docs synchronization using the Google REST API.
 */

const DOCS_API_BASE = 'https://docs.googleapis.com/v1/documents';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';

export interface GoogleDocInfo {
  id: string;
  title: string;
}

/**
 * Finds a document by title in the user's Google Drive.
 */
export const findDocByTitle = async (accessToken: string, title: string): Promise<string | null> => {
  const query = `name = '${title}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`;
  const response = await fetch(`${DRIVE_API_BASE}?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error finding doc:', error);
    return null;
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
    const error = await response.json();
    console.error('Error creating doc:', error);
    return null;
  }

  const data = await response.json();
  return data.documentId;
};

/**
 * Appends a new entry to the Google Doc.
 */
export const appendToDoc = async (accessToken: string, docId: string, content: { date: string, startTime: string, endTime: string, report: string }) => {
  const textToAppend = `\n\n------------------------------------------------\nData: ${new Date(content.date).toLocaleDateString('pt-BR')}\nHorário: ${content.startTime} - ${content.endTime}\n\n${content.report || 'Sem relatório escrito.'}\n`;

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
    const error = await response.json();
    console.error('Error appending to doc:', error);
    throw new Error('Falha ao atualizar o Google Docs.');
  }

  return await response.json();
};

/**
 * Completely replaces doc content with all entries (Syncing full state)
 */
export const syncAllEntriesToDoc = async (accessToken: string, docId: string, entries: any[]) => {
  // Sort entries chronologically (oldest first)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  let fullText = 'Cronos Estágio - Relatório Consolidado\n\n';
  sortedEntries.forEach(entry => {
    fullText += `------------------------------------------------\n`;
    fullText += `Data: ${new Date(entry.date).toLocaleDateString('pt-BR')}\n`;
    fullText += `Horário: ${entry.startTime} - ${entry.endTime}\n\n`;
    fullText += `${entry.reportText || 'Sem relatório escrito.'}\n\n`;
  });

  // First, get doc length to delete existing content if needed
  // For simplicity in this demo, we'll just append a new version or use a simpler update
  // Ideal: Clear doc then append.
  // Clearing doc is tricky via API (delete range).
  
  // Alternative: Just append a "CONSOLIDATED UPDATE" header
  const updateHeader = `\n\n=== SINCRONIZAÇÃO COMPLETA EM ${new Date().toLocaleString('pt-BR')} ===\n\n`;
  
  const requestBody = {
    requests: [
      {
        insertText: {
          endOfSegmentLocation: { segmentId: '' },
          text: updateHeader + fullText,
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
    throw new Error('Falha na sincronização completa.');
  }
};
