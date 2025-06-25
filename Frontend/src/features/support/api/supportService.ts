import { FAQItem } from '../types';
import { api } from '@/lib/api';

export async function getFaqs(): Promise<FAQItem[]> {
  return await api.get<FAQItem[]>('/faqs');
}
