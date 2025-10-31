import { Contact } from '@/types/contact';
import { Deal } from '@/types/deal';
import { Task } from '@/types/task';

// Generate CSV content for contacts
export const generateContactsCSV = (contacts: Contact[]): string => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Company',
    'Location',
    'Status',
    'Lead Stage',
    'Lead Score',
    'Tags',
    'Owner',
    'Created At',
    'Last Contact'
  ];

  const rows = contacts.map(contact => [
    contact.firstName,
    contact.lastName,
    contact.email,
    contact.phone || '',
    contact.company || '',
    contact.location || '',
    contact.status,
    contact.leadStage || '',
    contact.leadScore?.toString() || '',
    contact.tags.join('; '),
    contact.ownerName,
    new Date(contact.createdAt).toLocaleDateString(),
    contact.lastContactAt ? new Date(contact.lastContactAt).toLocaleDateString() : ''
  ]);

  return convertToCSV([headers, ...rows]);
};

// Generate CSV content for deals
export const generateDealsCSV = (deals: Deal[]): string => {
  const headers = [
    'Title',
    'Value',
    'Currency',
    'Stage',
    'Probability',
    'Owner',
    'Contacts',
    'Close Date',
    'Created At',
    'Description'
  ];

  const rows = deals.map(deal => [
    deal.title,
    deal.value.toString(),
    deal.currency,
    deal.stage,
    deal.probability?.toString() || '',
    deal.ownerName,
    deal.contacts.map(c => c.name).join('; '),
    deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : '',
    new Date(deal.createdAt).toLocaleDateString(),
    deal.description || ''
  ]);

  return convertToCSV([headers, ...rows]);
};

// Generate CSV content for tasks
export const generateTasksCSV = (tasks: Task[]): string => {
  const headers = [
    'Title',
    'Description',
    'Status',
    'Priority',
    'Due Date',
    'Assignee',
    'Related Type',
    'Related Title',
    'Created At',
    'Completed At'
  ];

  const rows = tasks.map(task => [
    task.title,
    task.description || '',
    task.status,
    task.priority,
    new Date(task.dueDate).toLocaleDateString(),
    task.assigneeName,
    task.relatedType || '',
    task.relatedTitle || '',
    new Date(task.createdAt).toLocaleDateString(),
    task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''
  ]);

  return convertToCSV([headers, ...rows]);
};

// Convert array of arrays to CSV string
const convertToCSV = (data: string[][]): string => {
  return data
    .map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if field contains comma, quote, or newline
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    )
    .join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Download PNG from canvas (for chart exports)
export const downloadChartAsPNG = (canvasElement: HTMLCanvasElement, filename: string): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvasElement.toDataURL('image/png');
  link.click();
};