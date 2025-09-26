import {UserAPI} from "@/lib/UserAPI";

export const modifyReply = async (id, body) => {
    const response = await UserAPI.post(`/reply/modify`, {
            id: id,
            body: body,
        }
    );
    return response.data;
};

export const deleteReply = async (id) => {
    const response = await UserAPI.delete(`/reply/${id}`);
    return response.data;
};
