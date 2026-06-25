import { IconFile, IconExternalLink, IconFileText, IconPhoto, IconVideo, IconMusic } from '@tabler/icons-react';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getMimeTypeColor = (mimeType: string): string => {
  if (mimeType.includes('image')) return 'blue';
  if (mimeType.includes('video')) return 'grape';
  if (mimeType.includes('audio')) return 'pink';
  if (mimeType.includes('pdf')) return 'red';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'indigo';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'green';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'orange';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'yellow';
  return 'gray';
};

export const getMimeTypeLabel = (mimeType: string): string => {
  const parts = mimeType.split('/');
  const subType = parts[1] || '';
  
  if (mimeType.includes('google-apps.document')) return 'Google Doc';
  if (mimeType.includes('google-apps.spreadsheet')) return 'Google Sheet';
  if (mimeType.includes('google-apps.presentation')) return 'Google Slides';
  if (mimeType.includes('google-apps.folder')) return 'Folder';
  
  if (mimeType.includes('pdf')) return 'PDF';
  if (subType.includes('word')) return 'Word';
  if (subType.includes('excel')) return 'Excel';
  if (subType.includes('powerpoint')) return 'PowerPoint';
  
  return subType.toUpperCase().replace(/[^a-zA-Z0-9]/g, ' ');
};