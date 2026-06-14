alter table leads
  add constraint leads_organization_phone_unique unique (organization_id, phone);

alter table conversations
  add constraint conversations_organization_phone_unique unique (organization_id, phone);

alter table whatsapp_instances
  add constraint whatsapp_instances_organization_unique unique (organization_id);

alter table whatsapp_instances
  add constraint whatsapp_instances_name_unique unique (instance_name);
