import { useRef } from "react";
import { X, Upload } from "lucide-react";
import {
  useAvailableAvatars,
  useSetAvatar,
  useUploadAvatar,
} from "@/hooks/useAvatarConfig";

interface AvatarPickerProps {
  agentId: string;
  agentName: string;
  currentImage: string;
  onClose: () => void;
}

export function AvatarPicker({
  agentId,
  agentName,
  currentImage,
  onClose,
}: AvatarPickerProps) {
  const { data: available = [] } = useAvailableAvatars();
  const setAvatar = useSetAvatar();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSelect(image: string) {
    setAvatar.mutate({ agentId, image }, { onSuccess: () => onClose() });
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate({ agentId, file }, { onSuccess: () => onClose() });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            Choose Avatar for {agentName}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-4 gap-3">
            {available.map((image) => (
              <button
                key={image}
                onClick={() => handleSelect(image)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  image === currentImage
                    ? "border-blue-500 ring-2 ring-blue-500/40"
                    : "border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Upload button */}
        <div className="p-4 border-t border-zinc-800">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload size={16} />
            {uploadAvatar.isPending ? "Uploading..." : "Upload Custom Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
