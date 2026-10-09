const CLOUD_NAME = "ujo1y0fc";
const UPLOAD_PRESET = "brikro_images";

export const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();

  return data.secure_url;
};