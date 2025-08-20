import { UserAPI } from "@/lib/userAPI";

// 댓글 수정
export const modifyReply = async (id, body) => {
    const response = await UserAPI.post(`/api/DiFF/reply/modify`, {
        id: id,
        body: body,
    });
    return response.data;
};

// 댓글 삭제
export const deleteReply = async (id) => {
    const response = await UserAPI.delete(`/api/DiFF/reply/${id}`);
    return response.data;
};
