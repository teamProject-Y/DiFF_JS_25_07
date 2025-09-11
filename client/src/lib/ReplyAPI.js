import { UserAPI } from "@/lib/UserAPI";

// 댓글 수정
export const modifyReply = async (id, body) => {
    const response = await UserAPI.post(`/reply/modify`, {
        id: id,
        body: body,
    });
    return response.data;
};

// 댓글 삭제
export const deleteReply = async (id) => {
    const response = await UserAPI.delete(`/reply/${id}`);
    return response.data;
};
