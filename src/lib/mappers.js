export function mapSpeaker(row) {
  return {
    id: row.id,
    name: row.name,
    position: row.position ?? "",
    company: row.company ?? "",
    bio: row.bio ?? "",
    image: row.image_url ?? "",
    enabled: row.enabled !== false,
  };
}

export function mapTopic(row) {
  return {
    id: row.id,
    name: row.name,
    enabled: row.enabled !== false,
  };
}

export function mapImportantDate(row) {
  return {
    id: row.id,
    step: row.step ?? "",
    title: row.title,
    date: row.date ?? "",
    description: row.description ?? "",
    icon: row.icon ?? "calendar",
    image: row.image_url ?? "",
    enabled: row.enabled !== false,
  };
}

export function mapWorkshop(row) {
  return {
    id: row.id,
    number: row.number ?? 0,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    facilitator: {
      name: row.facilitator_name ?? "",
      credentials: row.facilitator_credentials ?? "",
    },
    objectives: Array.isArray(row.objectives) ? row.objectives : [],
    duration: row.duration ?? "",
    price: Number(row.price ?? 0),
    currency: row.currency ?? "DH",
    image: row.image_url ?? "",
    enabled: row.enabled !== false,
  };
}

export function mapSponsor(row) {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo_url ?? "",
    enabled: row.enabled !== false,
  };
}

export function mapQuickLink(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    href: row.href ?? "",
    icon: row.icon ?? "document",
  };
}

export function speakerToRow(speaker, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    name: speaker.name,
    position: speaker.position,
    company: speaker.company,
    bio: speaker.bio,
    image_url: speaker.image,
    enabled: speaker.enabled !== false,
  };
}

export function topicToRow(topic, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    name: topic.name,
    enabled: topic.enabled !== false,
  };
}

export function dateToRow(item, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    step: item.step,
    title: item.title,
    date: item.date,
    description: item.description,
    icon: item.icon,
    image_url: item.image,
    enabled: item.enabled !== false,
  };
}

export function workshopToRow(workshop, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    number: workshop.number,
    title: workshop.title,
    subtitle: workshop.subtitle,
    description: workshop.description,
    facilitator_name: workshop.facilitator?.name,
    facilitator_credentials: workshop.facilitator?.credentials,
    objectives: workshop.objectives ?? [],
    duration: workshop.duration,
    price: workshop.price,
    currency: workshop.currency,
    image_url: workshop.image,
    enabled: workshop.enabled !== false,
  };
}

export function sponsorToRow(sponsor, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    name: sponsor.name,
    logo_url: sponsor.logo,
    enabled: sponsor.enabled !== false,
  };
}

export function quickLinkToRow(link, sortOrder = 0) {
  return {
    sort_order: sortOrder,
    title: link.title,
    description: link.description,
    href: link.href,
    icon: link.icon,
  };
}
