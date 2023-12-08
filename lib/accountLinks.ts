export const supportedLinks = ["twitter", "discord", "website", "instagram", "telegram"] as const
export type SupportedLink = typeof supportedLinks[number]