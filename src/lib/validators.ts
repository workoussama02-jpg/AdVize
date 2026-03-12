/**
 * Zod validation schemas for all user inputs in AdVize.
 * All validation logic is centralized in this file.
 *
 * @module validators
 */

import { z } from 'zod';

/** Preset industry categories for onboarding & settings */
export const INDUSTRY_OPTIONS = [
  'E-commerce',
  'Fashion & Apparel',
  'Home & Living',
  'Gifts & Personalization',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Food & Beverage',
  'Electronics',
  'Sports & Outdoors',
  'Kids & Baby',
  'Local Services',
  'SaaS/Software',
  'Education',
  'Real Estate',
  'Travel & Hospitality',
  'Finance',
  'Entertainment',
  'B2B Services',
  'Other',
] as const;

/** Campaign objective types mapping to Meta objectives */
export const CAMPAIGN_OBJECTIVES = [
  'Sales',
  'Leads',
  'Awareness',
  'Traffic',
] as const;

/** Ad copy frameworks used by the AI */
export const COPY_FRAMEWORKS = [
  'PAS',
  'BAB',
  'Social Proof Lead',
  'AIDA',
  'Loss Aversion',
] as const;

/** Campaign plan status values */
export const PLAN_STATUSES = [
  'draft',
  'approved',
  'exported',
  'archived',
] as const;

/** Ad format types */
export const AD_FORMATS = [
  'Single Image',
  'Carousel',
  'Video',
  'Collection',
] as const;

/** CTA button options */
export const CTA_OPTIONS = [
  'Shop Now',
  'Learn More',
  'Sign Up',
  'Get Offer',
  'Book Now',
  'Contact Us',
  'Download',
  'Apply Now',
  'Subscribe',
  'Watch More',
] as const;

/**
 * Strips HTML tags from a string for sanitization.
 */
function sanitizeText(value: string): string {
  return value
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ');
}

/** Schema for business profile during onboarding */
export const businessProfileSchema = z.object({
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be 100 characters or less')
    .transform(sanitizeText),
  industry: z.enum(INDUSTRY_OPTIONS, {
    message: 'Please select a valid industry',
  }),
  daily_budget: z
    .number()
    .min(1, 'Budget must be at least $1')
    .max(10000, 'Budget must be $10,000 or less')
    .multipleOf(0.01, 'Budget can have up to 2 decimal places'),
  website_url: z
    .string()
    .url('Please enter a valid URL')
    .startsWith('https://', 'URL must start with https://')
    .optional()
    .or(z.literal('')),
  scrape_consent: z.boolean().default(false),
});

/** Schema for campaign builder brief form */
export const campaignBriefSchema = z.object({
  promotion: z
    .string()
    .min(10, 'Please describe what you are promoting (at least 10 characters)')
    .max(1000, 'Description must be 1000 characters or less')
    .transform(sanitizeText),
  objective: z.enum(CAMPAIGN_OBJECTIVES, {
    message: 'Please select a campaign goal',
  }),
  ideal_customer: z
    .string()
    .min(10, 'Please describe your ideal customer (at least 10 characters)')
    .max(1000, 'Description must be 1000 characters or less')
    .transform(sanitizeText),
  daily_budget: z
    .number()
    .min(1, 'Budget must be at least $1')
    .max(10000, 'Budget must be $10,000 or less')
    .multipleOf(0.01, 'Budget can have up to 2 decimal places'),
  special_requirements: z
    .string()
    .max(1000, 'Requirements must be 1000 characters or less')
    .transform(sanitizeText)
    .optional()
    .or(z.literal('')),
});

/** Schema for media upload */
export const mediaUploadSchema = z.object({
  file_name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
  file_type: z.enum(
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
    { message: 'File type not supported. Allowed: JPEG, PNG, WebP, GIF, MP4' }
  ),
  file_size: z
    .number()
    .max(10 * 1024 * 1024, 'File must be 10MB or less'),
  tags: z
    .array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

/** Schema for settings update */
export const settingsUpdateSchema = z.object({
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be 100 characters or less')
    .transform(sanitizeText)
    .optional(),
  industry: z.enum(INDUSTRY_OPTIONS).optional(),
  daily_budget: z
    .number()
    .min(1, 'Budget must be at least $1')
    .max(10000, 'Budget must be $10,000 or less')
    .multipleOf(0.01)
    .optional(),
  website_url: z
    .string()
    .url('Please enter a valid URL')
    .startsWith('https://', 'URL must start with https://')
    .optional()
    .or(z.literal('')),
});

/** Schema for campaign plan inline edit */
export const planEditSchema = z.object({
  field: z.string(),
  value: z
    .string()
    .min(1, 'Value cannot be empty')
    .max(2000, 'Value too long')
    .transform(sanitizeText),
});

/** Schema for AI regeneration request */
export const regenerateSchema = z.object({
  section_id: z.string().uuid(),
  guidance: z
    .string()
    .max(500, 'Guidance must be 500 characters or less')
    .transform(sanitizeText)
    .optional()
    .or(z.literal('')),
});

/** Type exports derived from schemas */
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type CampaignBrief = z.infer<typeof campaignBriefSchema>;
export type MediaUpload = z.infer<typeof mediaUploadSchema>;
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
export type PlanEdit = z.infer<typeof planEditSchema>;
export type RegenerateRequest = z.infer<typeof regenerateSchema>;
