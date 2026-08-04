import api from "./api";

export async function getTrainingRequests() {
  const response = await api.get(
    "/training-requests"
  );

  return response.data;
}

export async function createTrainingRequest(requestData) {
  const response = await api.post(
    "/training-requests",
    requestData
  );

  return response.data;
}

export async function getCoachTrainingRequests(coachId) {
  const response = await api.get(
    `/training-requests/coach/${coachId}`
  );

  return response.data;
}

export async function updateTrainingRequestStatus(
  requestId,
  status
) {
  const response = await api.patch(
    `/training-requests/${requestId}`,
    { status }
  );

  return response.data;
}