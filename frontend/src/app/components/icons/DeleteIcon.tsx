import { Trash2 } from 'lucide-react';

export default function DeleteIcon({ className }: { className?: string }) {
  return <Trash2 className={className || "h-5 w-5 text-red-500 hover:text-red-700"} />;
}
