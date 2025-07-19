import { useEffect } from "react";
import { supabase } from "@/supabaseClient";

export function useSyncUserProfile() {
  useEffect(() => {
    const syncProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      // Check if already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        const { error } = await supabase.from("profiles").insert([
          {
            id: user.id,
            email: user.email,
            username: user.user_metadata.full_name || user.email?.split("@")[0],
            role: null,
          },
        ]);

        if (error) console.error("Error inserting profile:", error.message);
      }
    };

    syncProfile();
  }, []);
}
