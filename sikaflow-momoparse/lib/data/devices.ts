import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";
import { devicesMock } from "@/lib/mock-data";

export type Operator = "mtn" | "moov" | "celtiis";

export interface Device {
  id: string;
  name: string;
  deviceId: string;
  operators: Operator[];
  lastPingMin: number;
  isActive: boolean;
}

export async function getDevices(): Promise<Device[]> {
  if (!isSupabaseAuthConfigured()) {
    return devicesMock.map((d) => ({
      ...d,
      isActive: true,
    }));
  }

  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching devices:", error);
    return [];
  }

  const now = new Date();

  return (data || []).map((device) => {
    const lastPing = device.last_ping_at ? new Date(device.last_ping_at) : null;
    const lastPingMin = lastPing 
      ? Math.floor((now.getTime() - lastPing.getTime()) / 60000)
      : 9999;

    return {
      id: device.id,
      name: device.name || "Appareil sans nom",
      deviceId: device.device_id || "-",
      operators: (device.operators || []) as Operator[],
      lastPingMin,
      isActive: device.is_active ?? false,
    };
  });
}
