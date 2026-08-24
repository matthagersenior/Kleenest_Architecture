# Batch AB — Social/profile/notification hardening

- Removed anonymous mutation privileges from social interaction, profile preference, push-subscription, notification-preference, support-request, and feedback surfaces where authenticated ownership is required.
- Tightened social comment/like/save mutations to authenticated users and self-owned records.
- Tightened social comment updates to preserve post association.
- Tightened message sender mutation identity and prevented self-recipient sends.
- Preserved authenticated own-record RLS for notification and profile preference data.
