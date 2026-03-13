import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type AvatarConfig = Record<string, string>;

export function useAvatarConfig() {
  return useQuery<AvatarConfig>({
    queryKey: ["avatars"],
    queryFn: async () => {
      const res = await fetch("/api/avatars");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useAvailableAvatars() {
  return useQuery<string[]>({
    queryKey: ["avatars", "available"],
    queryFn: async () => {
      const res = await fetch("/api/avatars/available");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useSetAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      image,
    }: {
      agentId: string;
      image: string;
    }) => {
      const res = await fetch(`/api/avatars/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      file,
    }: {
      agentId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/avatars/${agentId}/upload`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}
