"use server";

import { supabase } from "@/lib/supabase";
import { Checklist, Summary } from "@/types/types";

export async function saveDoc(
  file: File,
  summary: Summary,
  rawText: string,
  deviceId: string
) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (storageError) throw storageError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          subject: summary.subject,
          translation: summary.translation,
          urgency: summary.urgency,
          deadline: summary.deadline,
          checklist: summary.checklist,
          legal_tip: summary.legalTip,
          raw_text: rawText,
          file_url: publicUrl,
          device_id: deviceId,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err: any) {
    console.error("Supabase Save Error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteDoc(id: string, fileUrl: string) {
  try {
    const fileName = fileUrl.split("/").pop();

    if (fileName) {
      await supabase.storage.from("documents").remove([fileName]);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Delete Error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateChecklist(id: string, checklist: Checklist[]) {
  try {
    const { error } = await supabase
      .from("documents")
      .update({ checklist })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Update Checklist Error:", err);
    return { success: false, error: err.message };
  }
}