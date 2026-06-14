export type AppointmentRequest = {
  lead_id: string;
  broker_id: string;
  property_id: string;
  date: string;
  time: string;
};

export function createAppointmentDraft(request: AppointmentRequest) {
  return {
    ...request,
    status: "scheduled" as const,
    notificationType: "appointment_created" as const
  };
}
