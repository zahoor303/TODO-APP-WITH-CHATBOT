import { Pencil } from 'lucide-react';

export default function EditIcon({ className }: { className?: string }) {
  return <Pencil className={className || "h-5 w-5 text-blue-500 hover:text-blue-700"} />;
}
