export const uploadAndTrain = async (file, userId, name, description) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("name", name);
  formData.append("description", description);

  const res = await fetch("http://localhost:8000/train", {
    method: "POST",
    body: formData,
  });
  return await res.json();
};
