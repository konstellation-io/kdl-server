import { toast } from 'react-toastify';

export function copyToClipboard(value: string) {
  const tempInput = document.createElement('input');
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
}

export function copyAndToast(value: string) {
  copyToClipboard(value);

  toast.info('Copied to clipboard');
  toast.clearWaitingQueue();
}
