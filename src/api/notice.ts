import { apiRequest } from "./apiRequest";
import type {
  LanguageCode,
  Notice,
  TNoticeInsert,
  TNoticeUpdate,
} from "./types";

export const NoticeApi = {
  get: async (isActive?: boolean) => {
    const url =
      isActive !== undefined ? `/notice?isActive=${isActive}` : "/notice";
    const data = await apiRequest<Notice[]>({
      method: "GET",
      url: url,
    });
    if (data.length === 0) throw new Error("No notices found");
    return data;
  },
  getById: async (id: number) => {
    const data = await apiRequest<Notice>({
      method: "GET",
      url: `/notice/${id}`,
    });
    if (!data) throw new Error("Notice not found");
    return data;
  },
  getByCode: async (code: LanguageCode) => {
    const data = await apiRequest<Notice[]>({
      method: "GET",
      url: `/notice/code/${code}`,
    });
    if (data.length === 0) throw new Error("No notices found");
    return data;
  },
  insert: async (body: TNoticeInsert) => {
    const data = await apiRequest<boolean>({
      method: "POST",
      url: "/notice",
      data: body,
    });

    if (!data) throw new Error("Failed to insert notice");
    return data;
  },
  update: async (id: number, body: TNoticeUpdate) => {
    const data = await apiRequest<boolean>({
      method: "PUT",
      url: `/notice/${id}`,
      data: body,
    });

    if (!data) throw new Error("Faild to update notice");
    return data;
  },
  delete: async (id: number) => {
    const data = await apiRequest<boolean>({
      method: "DELETE",
      url: `/notice/${id}`,
    });

    if (!data) throw new Error("Faild to delete notice");
    return data;
  },
};
