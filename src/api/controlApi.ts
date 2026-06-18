// api/controlApi.ts
import { api } from "@/api/api";
import type {
  MotorControlPayload,
  MotorControlResult,
  SolenoidControlPayload,
  SolenoidControlResult,
  ManualModePayload,
  ManualModeResult,
  ControlResponse,
} from "@/types/control";

export const controlApi = {
  // POST /api/control/motor
  motor: async (payload: MotorControlPayload): Promise<MotorControlResult> => {
    const res = await api.post<ControlResponse<MotorControlResult>>(
      "/api/control/motor",
      payload
    );
    return res.data.data;
  },

  // POST /api/control/solenoid
  solenoid: async (payload: SolenoidControlPayload): Promise<SolenoidControlResult> => {
    const res = await api.post<ControlResponse<SolenoidControlResult>>(
      "/api/control/solenoid",
      payload
    );
    return res.data.data;
  },

  // POST /api/control/manual-mode
  setManualMode: async (payload: ManualModePayload): Promise<ManualModeResult> => {
    const res = await api.post<ControlResponse<ManualModeResult>>(
      "/api/control/manual-mode",
      payload
    );
    return res.data.data;
  },
};
