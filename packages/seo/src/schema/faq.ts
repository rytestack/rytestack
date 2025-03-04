/**
 * @fileoverview FAQ schema utilities
 *
 * Utilities for creating FAQ schema markup.
 */
import { FAQPage, Question, Answer } from './types';

/**
 * Options for creating an FAQ schema
 */
export interface FAQSchemaOptions {
    /**
     * List of questions and answers
     */
    items: Array<{
        question: string;
        answer: string;
    }>;
}

/**
 * Creates an FAQ schema
 *
 * @param options FAQ schema options
 * @returns FAQ schema object
 *
 * @example
 * ```typescript
 * const schema = createFAQSchema({
 *   items: [
 *     {
 *       question: 'What is Rytestack?',
 *       answer: 'Rytestack is a multi-framework web development toolkit.'
 *     },
 *     {
 *       question: 'How do I install Rytestack?',
 *       answer: 'You can install Rytestack using npm or yarn.'
 *     }
 *   ]
 * });
 * ```
 */
export function createFAQSchema(options: FAQSchemaOptions): FAQPage {
    const { items } = options;

    // Create questions
    const questions: Question[] = items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
        }
    }));

    // Create FAQ schema
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions
    };
}