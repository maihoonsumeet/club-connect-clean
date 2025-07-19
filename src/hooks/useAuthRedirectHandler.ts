import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";

export function useAuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      // Fetch profile role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile after login:", error.message);
        navigate("/rolechooser"); // fallback
        return;
      }

      if (!profile?.role) {
        navigate("/rolechooser");
      } else if (profile.role === "fan") {
        navigate("/fandashboard");
      } else if (profile.role === "club") {
        navigate("/clubdashboard");
      } else {
        navigate("/rolechooser");
      }
    };

    checkSession();
  }, []);
}
