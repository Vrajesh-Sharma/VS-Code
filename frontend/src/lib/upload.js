import { supabase } from "./supabase";

export async function uploadImage(file, folder = "original") {
  try {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("scans")
      .upload(`${folder}/${fileName}`, file);

    if (error) {
      console.error("❌ Upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("scans")
      .getPublicUrl(`${folder}/${fileName}`);

    return publicUrlData.publicUrl;

  } catch (err) {
    console.error("🔥 Upload crash:", err);
    return null;
  }
}