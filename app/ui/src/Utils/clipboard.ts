import { toast } from 'react-toastify';

export function copyToClipboard(value: string) {
  const tempInput = document.createElement('input');
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  toast.info('Copied to clipboard');
}

export async function copyAndToast(value: string) {
  await navigator.clipboard.writeText(value);

  toast.info('Copied to clipboard');
  toast.clearWaitingQueue();
}
