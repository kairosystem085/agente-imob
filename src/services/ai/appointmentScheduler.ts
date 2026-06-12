export type AppointmentRequest = {
  leadId: string;
  brokerId: string;
  propertyId: string;
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
