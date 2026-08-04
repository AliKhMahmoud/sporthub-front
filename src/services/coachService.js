import api from "./api";

export const getApprovedCoaches = async (sport) => {
  const response = await api.get(
    `/coaches?sport=${sport}`
  );

  return response.data;
};