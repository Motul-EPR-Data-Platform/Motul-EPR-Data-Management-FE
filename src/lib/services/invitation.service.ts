import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import { SendInvitationDTO } from "@/types/index";

export const InvitationService = {
  async send(dto: SendInvitationDTO): Promise<{ ok: true }> {
    console.log("Sending invitation to", dto);
    await api.post(path.invitations(ENDPOINTS.INVITATIONS.SEND), dto);
    return { ok: true };
  },
};
