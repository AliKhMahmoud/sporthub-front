import api from "./api";

export async function getMyTrainingProgress() {
  const response = await api.get(
    "/progress/my"
  );

  return response.data;
}

export async function getTrainingProgressBySport(
  sportSlug
) {
  const response = await api.get(
    `/progress/sport/${sportSlug}`
  );
  return response.data;
}

export async function startWorkout(data) {
  const response = await api.post(
    "/progress",
    data
  );

  return response.data;
}

export async function requestProgressReview(workoutId) {
  const response = await api.post(
    `/progress/${workoutId}/review-request`
  );
  return response.data;
}

export async function getProgressReviewRequests() {
  const response = await api.get(
    "/progress/review-requests"
  );

  return response.data;
}

export async function approveProgressReview(
  reviewId,
  data
) {
  const response = await api.patch(
    `/progress/review-requests/${reviewId}/approve`,
    data
  );

  return response.data;
}

export async function rejectProgressReview(
  reviewId,
  data
) {
  const response = await api.patch(
    `/progress/review-requests/${reviewId}/reject`,
    data
  );

  return response.data;
}