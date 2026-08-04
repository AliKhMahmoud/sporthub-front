import api from "./api";

export async function getSportComments(
  sportId
) {
  const response = await api.get(`
    /sports/${sportId}/comments`
  );

  return response.data;
}

export async function addSportComment(
  sportId,
  comment
) {
  const response = await api.post(`
    /sports/${sportId}/comments`,
    {
      text: comment,
    }
  );

  return response.data;
}